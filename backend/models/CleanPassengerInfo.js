const mongoose = require('mongoose');

const cleanPassengerInfoSchema = new mongoose.Schema({
    YEAR: Number,
    MONTH: Number,
    DEST_STATE_ABR: String,
    ORIGIN_STATE_ABR: String,
    PASSENGERS: Number
});

module.exports = mongoose.model('Passenger', cleanPassengerInfoSchema);