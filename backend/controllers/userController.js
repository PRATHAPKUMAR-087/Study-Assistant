const mysql = require('mysql2');
const db = require("../config/db");

// Function to get user by email and return username
const getUser = (req, res) => {
    const { email } = req.query; // Get email from query params
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    // Query the database to find the user by email
    db.query('SELECT username FROM users WHERE email = ?', [email], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the username
      return res.status(200).json({ username: results[0].username });
    });
  };
  
  module.exports = { getUser };
