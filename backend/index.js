require('dotenv').config(); // if using an .env file (optional, as Docker sets them automatically)

// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const footfallRoutes = require('./footfall/routes');

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection URI (replace with your own MongoDB URI)
const mongoURI = "mongodb://asd:asdf@localhost:27017/?authSource=admin";
console.log(mongoURI)

// Use the users routes
app.use('/api/mongo', footfallRoutes);
// For MongoDB Atlas, use: 
// const mongoURI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/mydb?retryWrites=true&w=majority';

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected');
  });
  
  mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected');
  });
// Define a basic route
app.get('/', (req, res) => {
    console.log(`mongoose.connection.readyState`);
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
