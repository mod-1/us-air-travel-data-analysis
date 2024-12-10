const dotenv = require('dotenv') // if using an .env file (optional, as Docker sets them automatically)

dotenv.config({path: '../.env'});

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

// Use the users routes
app.use('/api', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
