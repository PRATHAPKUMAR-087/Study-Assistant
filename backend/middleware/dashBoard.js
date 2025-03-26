// routes/dashboard.js
const express = require("express");
const verifyToken = require("../middlewares/verifyToken"); // Import the verifyToken middleware
const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
    // If token is valid, the request will proceed here
    res.json({ success: true, message: "Welcome to the dashboard!", user: req.user });
});

module.exports = router;
