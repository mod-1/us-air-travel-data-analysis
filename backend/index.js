require('dotenv').config({path: "../.env"}); // if using an .env file (optional, as Docker sets them automatically)

// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;
const routes = require('./routes');


app.use(cors());
// Middleware to parse JSON
app.use(express.json());

// MongoDB connection URI (replace with your own MongoDB URI)
const mongoURI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${process.env.MONGO_DB_NAME}?authSource=admin`;
//const mongoURI = `mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`;
//const mongoURI = `mongodb://localhost:27017/${process.env.MONGO_INITDB_DATABASE}`;
// const mongoURI = `mongodb://localhost:27017/holiday_data`;

console.log(`test: `+mongoURI)

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});



app.use('/api', routes);


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
