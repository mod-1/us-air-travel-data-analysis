const express = require('express');
const router = express.Router();

const gdpRoutes = require('./gdp');
const empRoutes = require('./employee')
const flightEconRoutes=require('./flightecon');

router.use(gdpRoutes);
router.use(empRoutes);
router.use(flightEconRoutes);

module.exports = router;