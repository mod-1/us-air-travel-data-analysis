// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB connection URI (replace with your own MongoDB URI)
const mongoURI = 'mongodb://localhost:27017/mydb'; // For local MongoDB
// For MongoDB Atlas, use: 
// const mongoURI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/mydb?retryWrites=true&w=majority';

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
