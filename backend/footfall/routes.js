const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

router.get('/', (req, res) => {
    res.json(mongoose.json);
 });

module.exports = router;
