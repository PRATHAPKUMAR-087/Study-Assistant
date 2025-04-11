const cron = require('node-cron');
const mysql = require('mysql2/promise'); // ✅ Import promise-based mysql2

// ✅ Create a new pool for this file
const db = mysql.createPool({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "kpk6810790",
    database: "study_assistant",
});

function startReminderJob() {
  cron.schedule('* * * * *', async () => {
    const currentTime = new Date();

    try {
      const [reminders] = await db.query(
        'SELECT * FROM reminders WHERE reminder_time <= ? AND is_notified = 0',
        [currentTime]
      );

      for (const reminder of reminders) {
        // ✅ Your logic here
        console.log(`🔔 Reminder for User ${reminder.user_id}: ${reminder.title}`);

        // ✅ Mark as notified
        await db.query('UPDATE reminders SET is_notified = 1 WHERE id = ?', [reminder.id]);
      }
    } catch (error) {
      console.error('❌ Error running reminder cron job:', error);
    }
  });
}

module.exports = startReminderJob;
