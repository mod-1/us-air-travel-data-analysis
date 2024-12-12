const express = require('express');
const router = express.Router();
const CleanPassengerInfo = require('../models/CleanPassengerInfo');
const { default: mongoose } = require('mongoose');

// Middleware to validate query parameters
// router.use((req, res, next) => {
//     //assumption is dates are strings!
//     const { state, startDate, endDate, inbound } = req.query;

//     if (!state || !startDate || !endDate || typeof inbound === 'undefined') {
//         return res.status(400).json({ error: "Missing one or more required query parameters: state OR startDate OR endDate OR inbound" });
//     }

//     // Validate that dates are valid
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (isNaN(start) || isNaN(end)) {
//         return res.status(400).json({ error: "Invalid startDate or endDate format" });
//     }

//     req.query.startDate = start;
//     req.query.endDate = end;
//     req.query.inbound = inbound === 'true'; // Convert to boolean

//     next();
// });

router.get('/employee', async (req, res) => {
    const { state, startDate, endDate, inbound } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const stateField = inbound ? "DEST_STATE_ABR" : "ORIGIN_STATE_ABR"; // Dynamic state field

    try {
        // First aggregation query for passenger data
        await CleanPassengerInfo.aggregate([
            {
                // Filter records within the specified date range
                $match: {
                    $or: [
                        // Same year: filter by month
                        {
                            YEAR: start.getFullYear(),
                            MONTH: { $gte: start.getMonth() + 1 }
                        },
                        {
                            YEAR: end.getFullYear(),
                            MONTH: { $lte: end.getMonth() + 1 }
                        },
                        // Years between startDate and endDate
                        {
                            YEAR: { $gt: start.getFullYear(), $lt: end.getFullYear() }
                        }
                    ]
                }
            },
            {
                // Group by year, month, and dynamic state field (DEST_STATE_ABR or ORIGIN_STATE_ABR)
                $group: {
                    _id: {
                        YEAR: "$YEAR",
                        MONTH: "$MONTH",
                        [stateField]: state
                    },
                    total_passengers: { $sum: "$PASSENGERS" }
                }
            },
            {
                // Project the desired output fields
                $project: {
                    _id: 0,
                    YEAR: "$_id.YEAR",
                    MONTH: "$_id.MONTH",
                    [stateField]: state,
                    total_passengers: 1
                }
            },
            {
                // Output the result to a collection
                $out: "passenger_agg_stats"
            }
        ]);

        var finalResponse = await mongoose.connection.collection('passenger_agg_stats').aggregate([
            {
                $lookup: {
                    from: "employee_data",
                    let: { state: `$${stateField}`, year: "$YEAR", month: "$MONTH" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$state", "$$state"] }, // Match state
                                        { $eq: ["$YEAR", "$$year"] }, // Match year
                                        { $eq: ["$MONTH", "$$month"] } // Match month
                                    ]
                                }
                            }
                        }
                    ],
                    as: "employee_info" // Joined result
                }
            },
            {
                // Unwind the joined array to flatten the structure
                $unwind: {
                    path: "$employee_info",
                    preserveNullAndEmptyArrays: true // Handle cases where no match is found
                }
            },
            {
                // Project the desired fields
                $project: {
                    YEAR: 1,
                    MONTH: 1,
                    STATE: `$${stateField}`,
                    total_passengers: 1,
                    total_employees: "$employee_info.employment_stat" // Include employment_stat from employee_data
                }
            }
        ]);
        
        
        var empWithPass = await finalResponse.toArray();
        
        
        res.status(200).json({
            message: "Aggregation complete",
            empWithPass
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during aggregation" });
    }
});

module.exports = router;