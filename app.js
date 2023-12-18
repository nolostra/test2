const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
require('dotenv').config()
// Connect to MongoDB
mongoose.connect(`${process.env.MongoDB}`);

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

// Define user model
const User = mongoose.model('User', userSchema);

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Endpoint for creating a user
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint for getting users with filters (name, sorting, pagination)
app.get('/users', async (req, res) => {
  try {
    let query = {};

    // Filter by name
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive search
    }

    // Sorting by age
    let sortDirection = 1; // Default ascending order
    if (req.query.sortBy) {
      const order = req.query.sortOrder && req.query.sortOrder.toLowerCase() === 'desc' ? -1 : 1;
      sortDirection = order;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const users = await User.find(query)
      .sort({ age: sortDirection })
      .skip(skip)
      .limit(pageSize);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
