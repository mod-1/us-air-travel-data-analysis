const mongoose = require('mongoose');

const gdpSchema = new mongoose.Schema({
  year: Number,
  quarter: String,
  gdp_value: Number,
  Region: String
});

const gdp = mongoose.model('Gdp', gdpSchema);

module.exports = gdp;