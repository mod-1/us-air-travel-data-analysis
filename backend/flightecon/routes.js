const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/getFilters', (req, res) => {
    const data={
        "filters":["UNIQUE_CARRIER_NAME"],
        "fields":["FLIGHT_EQUIP"],
    }
    res.json(data);
 });

//  router.get('/getData', async (req, res) => {
//     const data=await mongoose.Collection.findOne();
//     res.json(data);
//  });

//  module.exports=router