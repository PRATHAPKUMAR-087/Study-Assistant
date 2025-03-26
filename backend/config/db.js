// config/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "kpk6810790",
    database: "study_assistant",
});

db.connect((err) => {
    if (err) console.error("Database connection failed:", err);
    else console.log("Connected to MySQL database");
});

module.exports = db;