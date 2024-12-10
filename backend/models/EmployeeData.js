const mongoose = require('mongoose');

const employeeDataSchema = new mongoose.Schema({
    YEAR: Number,
    MONTH: Number,
    state: String,
    employment_stat: Number,
});

module.exports = mongoose.model('Employee', employeeDataSchema);