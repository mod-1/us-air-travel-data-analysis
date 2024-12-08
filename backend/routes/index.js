const express = require('express');
const router = express.Router();

const gdpRoutes = require('./gdp');

router.use(gdpRoutes);

module.exports = router;