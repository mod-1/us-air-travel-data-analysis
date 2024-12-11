const express = require('express');
const router = express.Router();
const CleanPassengerInfo = require('../models/CleanPassengerInfo');

router.get('/gdp', async (req, res) => {
  const { state, startDate, endDate } = req.query;

  let startYear, startQuarter, endYear, endQuarter;

  if (startDate) {
    const start = new Date(startDate);
    startYear = start.getFullYear();
    startQuarter = Math.floor((start.getMonth() + 3) / 3);
  }

  if (endDate) {
    const end = new Date(endDate);
    endYear = end.getFullYear();
    endQuarter = Math.floor((end.getMonth() + 3) / 3);
  }

  // Build the aggregation pipeline for passengers
  let passengerMatch = {};
  if (state) {
    passengerMatch.ORIGIN_STATE_NM = state;
  }

  if (startDate && endDate) {
    passengerMatch.YEAR = { $gt: startYear, $lt: endYear };
    passengerMatch.$or = [
      { YEAR: startYear, QUARTER: { $gte: startQuarter } },
      { YEAR: endYear, QUARTER: { $lte: endQuarter } }
    ];
  } else if (startDate) {
    passengerMatch.YEAR = { $gte: startYear };
    passengerMatch.QUARTER = { $gte: startQuarter };
  } else if (endDate) {
    passengerMatch.YEAR = { $lte: endYear };
    passengerMatch.QUARTER = { $lte: endQuarter };
  }
   try {
     const pipeline = [
      { $match: passengerMatch },
      {
        $group: {
          _id: {
            year: '$YEAR',
            quarter: '$QUARTER'
          },
          totalPassengers: { $sum: '$PASSENGERS' }
        }
      },
      {
        $lookup: {
          from: 'gdp',
          let: { year: '$_id.year', quarter: '$_id.quarter' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$year', '$$year'] },
              { $eq: ['$quarter', '$$quarter'] },
              ...(state ? [{ $eq: ['$Region', state] }] : [{ $eq: ['$Region', 'United States'] }])
            ]}}}
          ],
          as: 'gdpData'
        }
      },
      { $unwind: { path: '$gdpData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          year: '$_id.year',
          quarter: '$_id.quarter',
          region: state || 'United States',
          passenger_count: '$totalPassengers',
          gdp: { $ifNull: ['$gdpData.gdp_value', 0] }
        }
      },
      { $sort: { year: 1, quarter: 1 } }
    ];

    const result = await CleanPassengerInfo.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;