const mongoose = require('mongoose');

const cleanPassengerInfoSchema = new mongoose.Schema({
    YEAR: Number,
    MONTH: Number,
    QUARTER: Number,
    DEST_STATE_ABR: String,
    ORIGIN_STATE_ABR: String,
    ORIGIN_STATE_NM: String,
    PASSENGERS: Number
});

module.exports = mongoose.model('Passenger', cleanPassengerInfoSchema, 'clean-passenger-info');