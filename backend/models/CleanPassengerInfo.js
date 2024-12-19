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

cleanPassengerInfoSchema.index({ YEAR: 1, QUARTER: 1, MONTH: 1 });
cleanPassengerInfoSchema.index({ ORIGIN_STATE_NM: 1 });
cleanPassengerInfoSchema.index({ ORIGIN_STATE_ABR: 1 });
cleanPassengerInfoSchema.index({ DEST_STATE_ABR: 1 });

module.exports = mongoose.model('Passenger', cleanPassengerInfoSchema, 'clean-passenger-info');