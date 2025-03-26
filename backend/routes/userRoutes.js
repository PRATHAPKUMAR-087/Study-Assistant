const express = require('express');
const router = express.Router();
const { getUser } = require('../controllers/userController');

// Define the GET route for fetching user by email
router.get('/getUser', getUser);

module.exports = router;
