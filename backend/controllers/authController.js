const express = require("express");
const session = require("express-session"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { v4: uuidv4 } = require('uuid'); // Import UUID function

const register = async (req, res) => {
    const { username, email, password } = req.body;
    const userUUID = uuidv4(); // Generate unique UUID for each user

    try {
        // Check if the email is already registered
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered." });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user into the database with UUID
        await db.promise().query("INSERT INTO users (username, email, password, uuid) VALUES (?, ?, ?, ?)", [username, email, hashedPassword, userUUID]);
        
        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists
        const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        const user = users[0];

        // ✅ Ensure `req.session` exists before setting properties
        if (!req.session) {
            return res.status(500).json({ success: false, message: "Session not initialized. Try again." });
        }

        req.session.userId = user.uuid; // ✅ Fix for session storage

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret_key", { expiresIn: "1h" });

        // ✅ Send response with UUID
        res.json({
            success: true,
            token,
            uuid: user.uuid,
            username: user.username
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};



module.exports = { register, login };
