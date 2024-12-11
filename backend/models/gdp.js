const mongoose = require('mongoose');

const gdpSchema = new mongoose.Schema({
  year: Number,
  quarter: Number,
  gdp_value: Number,
  Region: String
});

gdpSchema.index({ year: 1, quarter: 1 });
gdpSchema.index({ Region: 1 });

const gdp = mongoose.model('Gdp', gdpSchema, 'gdp');

module.exports = gdp;