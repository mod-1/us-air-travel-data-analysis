const express = require('express');
const router = express.Router();
const Econ = require('../models/flightEcon');
const { default: mongoose } = require('mongoose');

router.get('/flightEcon', async (req, res) => {
    const data=await Econ.findOne({});
    console.log(data)
    res.json(data);
 });

module.exports=router;