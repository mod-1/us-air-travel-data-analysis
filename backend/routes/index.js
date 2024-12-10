const express = require('express');
const router = express.Router();

const gdpRoutes = require('./gdp');
const empRoutes = require('./employee')

router.use(gdpRoutes);
router.use(empRoutes);

module.exports = router;