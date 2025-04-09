// config/db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "kpk6810790",
    database: "study_assistant",
});
// existing DB config

// ------------------------
// SET REMINDER - already present
// ------------------------
const setReminder = async (req, res) => {
  const { userId, planId, title, description, reminderTime } = req.body;

  if (!userId || !title || !reminderTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO reminders (user_id, plan_id, title, description, reminder_time) VALUES (?, ?, ?, ?, ?)',
      [userId, planId || null, title, description || '', reminderTime]
    );
    res.status(200).json({ message: 'Reminder set successfully' });
  } catch (err) {
    console.error('Error inserting reminder:', err);
    res.status(500).json({ message: 'Failed to set reminder' });
  }
};

// ------------------------
// GET REMINDERS BY USER
// ------------------------
const getRemindersByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [reminders] = await db.query(
      'SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_time ASC',
      [userId]
    );
    res.status(200).json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
};

const deleteReminder = async (req, res) => {
    const reminderId = req.params.id;
  
    try {
      await db.query('DELETE FROM reminders WHERE id = ?', [reminderId]);
      res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (err) {
      console.error('Error deleting reminder:', err);
      res.status(500).json({ message: 'Failed to delete reminder' });
    }
  };
  
module.exports = {
  setReminder,
  getRemindersByUser,
  deleteReminder, 
};
