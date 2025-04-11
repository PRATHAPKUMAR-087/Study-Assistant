// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quizRoutes"); // ✅ Import Quiz Routes
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const reminderRoutes = require("./routes/reminderRoutes"); // ✅ Import Reminder Routes
const startReminderJob = require('./jobs/reminderChecker');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ✅ Configure CORS (Allow Credentials for Sessions)
app.use(cors({
    origin: "http://localhost:5173", // Change if frontend URL is different
    credentials: true
}));

// ✅ Add express-session Middleware
app.use(session({
    secret: "your_secret_key", // Change this to a secure random string
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,  // Set to `true` if using HTTPS
        httpOnly: true  // Prevents client-side access to cookies
    }
}));

// ✅ Database Connection
db.connect();

// ✅ Debugging: Check Session
app.use((req, res, next) => {
    //console.log("Session:", req.session); // Should not be undefined now
    next();
});

// ✅ Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", studyPlanRoutes);
app.use("/api", quizRoutes); // ✅ Use Quiz Routes
app.use("/api", reminderRoutes); // ✅ Use Reminder Routes

startReminderJob();
// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
