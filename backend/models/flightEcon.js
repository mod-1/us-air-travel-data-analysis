const mongoose = require('mongoose');

// Define a schema
const econSchema = new mongoose.Schema({
    CASH: Number,
    SHORT_TERM_INV: Number,
  },{collection: "flight_econ"});
  
  // Create a model
const Econ = mongoose.model('flight_econ', econSchema);

module.exports=Econ;