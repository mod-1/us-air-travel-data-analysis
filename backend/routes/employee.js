const express = require('express');
const router = express.Router();
const CleanPassengerInfo = require('../models/CleanPassengerInfo');
const EmployeeData = require('../models/EmployeeData');

// Middleware to validate query parameters
router.use((req, res, next) => {
    const { state, startDate, endDate, inbound } = req.query;

    if (!state || !startDate || !endDate || typeof inbound === 'undefined') {
        return res.status(400).json({ error: "Missing one or more required query parameters: state OR startDate OR endDate OR inbound" });
    }

    // Validate that dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: "Invalid startDate or endDate format" });
    }

    req.query.startDate = start;
    req.query.endDate = end;
    req.query.inbound = inbound === 'true'; // Convert to boolean

    next();
});

router.get('/employee', async (req, res) => {
    const { state, startDate, endDate, inbound } = req.query;

    const stateField = inbound ? "DEST_STATE_ABR" : "ORIGIN_STATE_ABR"; // Dynamic state field

    try {
        // First aggregation query for passenger data
        const passengerResults = await CleanPassengerInfo.aggregate([
            {
                // Filter records within the specified date range
                $match: {
                    $or: [
                        // Same year: filter by month
                        {
                            YEAR: startDate.getFullYear(),
                            MONTH: { $gte: startDate.getMonth() + 1 }
                        },
                        {
                            YEAR: endDate.getFullYear(),
                            MONTH: { $lte: endDate.getMonth() + 1 }
                        },
                        // Years between startDate and endDate
                        {
                            YEAR: { $gt: startDate.getFullYear(), $lt: endDate.getFullYear() }
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
                    STATE: state,
                    total_passengers: 1
                }
            }
        ]);

        console.log(passengerResults);

        
        res.status(200).json({
            message: "Aggregation complete",
            passengerResults
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during aggregation" });
    }
});

module.exports = router;