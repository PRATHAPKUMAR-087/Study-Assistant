const express = require('express');
const router = express.Router();
const { setReminder, getRemindersByUser, deleteReminder } = require('../controllers/reminderController');

// Route to set a reminder
router.post("/setReminder", setReminder);

// Route to get all reminders for a user
router.get("/getReminders/:userId", getRemindersByUser);

// Route to delete a reminder
router.delete("/deleteReminder/:id", deleteReminder);

module.exports = router;
