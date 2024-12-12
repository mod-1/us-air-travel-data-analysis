const express = require('express');
const router = express.Router();
const Econ = require('../models/flightEcon');
const CleanPassengerInfo = require('../models/CleanPassengerInfo');
const { default: mongoose } = require('mongoose');

router.get('/flightEcon', async (req, res) => {
    const { startDate, endDate,carrierName,econField } = req.query;

    console.log(carrierName,econField);

    let startYear, startQuarter, endYear, endQuarter;
  
    if (startDate) {
      const start = new Date(startDate);
      console.log(start);
      startYear = start.getFullYear();
      startQuarter = Math.floor((start.getMonth() + 3) / 3);
    }
  
    if (endDate) {
      const end = new Date(endDate);
      endYear = end.getFullYear();
      endQuarter = Math.floor((end.getMonth() + 3) / 3);
    }

    console.log(startYear,startQuarter,endYear,endQuarter);
  
    // Build the query object for GDP
    let flightQuery = {};
    if (carrierName) {
      flightQuery.UNIQUE_CARRIER_NAME = carrierName;
    } else {
      flightQuery.UNIQUE_CARRIER_NAME = 'United States';
    }
  
    if (startDate && endDate) {
      flightQuery.$or = [
        { YEAR: { $gte: startYear, $lte: endYear }, QUARTER: { $gte: startQuarter, $lte: endQuarter }, },
      ];
    } else if (startDate) {
      flightQuery.YEAR = { $gte: startYear };
      flightQuery.QUARTER = { $gte: startQuarter };
    } else if (endDate) {
      flightQuery.YEAR = { $lte: endYear };
      flightQuery.QUARTER = { $lte: endQuarter };
    }
  
    // Build the aggregation pipeline for passengers
    let passengerMatch = {};
    if (carrierName) {
      passengerMatch.UNIQUE_CARRIER_NAME = carrierName;
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
    console.log("Lets gooo")
     try {
      // const pipeline = [
      //   { $match: gdpQuery },
      //   {
      //     $lookup: {
      //       from: 'clean-passenger-info',
      //       let: { year: '$year', QUARTER: '$QUARTER' },
      //       pipeline: [
      //         { $match: { $expr: { $and: [
      //           { $eq: ['$YEAR', '$$year'] },
      //           { $eq: ['$QUARTER', '$$QUARTER'] },
      //           ...(state ? [{ $eq: ['$ORIGIN_STATE_NM', state] }] : [])
      //         ]}}},
      //         { $group: {
      //           _id: null,
      //           totalPassengers: { $sum: '$PASSENGERS' }
      //         }}
      //       ],
      //       as: 'passengerData'
      //     }
      //   },
      //   { $unwind: { path: '$passengerData', preserveNullAndEmptyArrays: true } },
      //   {
      //     $project: {
      //       year: 1,
      //       QUARTER: 1,
      //       region: '$Region',
      //       passenger_count: { $ifNull: ['$passengerData.totalPassengers', 0] },
      //       gdp: '$gdp_value'
      //     }
      //   },
      //   { $sort: { year: 1, QUARTER: 1 } }
       // ];
       
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
            from: 'flight_econ',
            let: { year: '$_id.year', quarter: '$_id.quarter' },
            pipeline: [
              { $match: { $expr: { $and: [
                { $eq: ['$YEAR', '$$year'] },
                { $eq: ['$QUARTER', '$$quarter'] },
                ...(carrierName ? [{ $eq: ['$UNIQUE_CARRIER_NAME', carrierName] }] : [{ $eq: ['$UNIQUE_CARRIER_NAME', 'United States'] }])
              ]}}}
            ],
            as: 'flight_econ_data'
          }
        },
        { $unwind: { path: '$flight_econ_data', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            year: '$_id.year',
            quarter: '$_id.quarter',
            region: carrierName || 'United States',
            passenger_count: '$totalPassengers',
            data: { $ifNull: [`$flight_econ_data.${econField}`, 0] }
          }
        },
        { $sort: { YEAR: 1, QUARTER: 1 } }
      ];
  
      const result = await CleanPassengerInfo.aggregate(pipeline);
    //   console.log('Result:', result);
  
      res.json(result);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  
  module.exports = router;