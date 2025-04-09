import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../Styles/ViewReminders.css'; // 👈 Import the CSS here

const ViewReminders = () => {
  const [reminders, setReminders] = useState([]);
  const userId = sessionStorage.getItem('userUUID');

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/getReminders/${userId}`);
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/deleteReminder/${id}`);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return (
    <div className="reminders-container">
      <h2>Your Reminders</h2>
      {reminders.length === 0 ? (
        <p>No reminders yet. <a href='/set-reminder'>Create a reminder</a> </p>
      ) : (
        <ul>
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <strong>{reminder.title}</strong>
              <p>{reminder.description}</p>
              <p>
                <strong>Reminder Time:</strong>{' '}
                {new Date(reminder.reminder_time).toLocaleString()}
              </p>

              <button onClick={() => deleteReminder(reminder.id)}>
                Delete Reminder
              </button>

              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewReminders;
