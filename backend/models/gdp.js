const mongoose = require('mongoose');

const gdpSchema = new mongoose.Schema({
  year: Number,
  quarter: Number,
  gdp_value: Number,
  Region: String
});

const gdp = mongoose.model('Gdp', gdpSchema, 'gdp');

module.exports = gdp;