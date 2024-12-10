require('dotenv').config({path: "../.env"}); // if using an .env file (optional, as Docker sets them automatically)

// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const routes = require('./routes');


// Middleware to parse JSON
app.use(express.json());

// MongoDB connection URI (replace with your own MongoDB URI)
const mongoURI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/us-air?authSource=admin`;
console.log(mongoURI)

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Define a schema
const econSchema = new mongoose.Schema({
    CASH: Number,
    SHORT_TERM_INV: Number,
  },{collection: "flight_econ"});
  
  // Create a model
const Econ = mongoose.model('flight_econ', econSchema);

app.get('/getData', async (req, res) => {
    const data=await Econ.findOne({});
    console.log(data)
    res.json(data);
 });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
