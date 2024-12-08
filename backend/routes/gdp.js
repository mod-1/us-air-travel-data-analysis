const express = require('express');
const router = express.Router();
const gdp = require('../models/gdp');

router.get('/gdp', async (req, res) => {
  const { year, quarter, region } = req.query;

  let query = {};

  if (year) {
    query.year = year;
  }

  if (quarter) {
    query.quarter = quarter;
  }

  if (region) {
    query.Region = region;
  }

  try {
    const filteredData = await gdp.find(query);
    res.json(filteredData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;