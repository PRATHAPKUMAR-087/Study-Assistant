import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../Styles/SetReminder.css'; // Import the CSS

const SetReminder = () => {
  const [userId, setUserId] = useState('');
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    const userUUID = sessionStorage.getItem('userUUID');
    if (userUUID) {
      setUserId(userUUID);

      axios
        .get(`http://localhost:5000/api/get-user-plans/${userUUID}`)
        .then((res) => {
          setPlans(res.data);
        })
        .catch((err) => {
          console.error('Error fetching plans:', err);
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/setReminder', {
        userId,
        planId,
        title,
        description,
        reminderTime,
      });

      console.log('Reminder set successfully:', response.data);
      alert('Reminder set successfully!');

      // Clear form
      setPlanId('');
      setTitle('');
      setDescription('');
      setReminderTime('');
    } catch (err) {
      console.error('Error setting reminder:', err);
      alert('Failed to set reminder.');
    }
  };

  return (
    <div className="reminder-container">
      <h2>Set Reminder</h2>
      <form onSubmit={handleSubmit}>
        <label>Choose Study Plan:</label>
        <select value={planId} onChange={(e) => setPlanId(e.target.value)} required>
          <option value="">-- Select a Plan --</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.topic}
            </option>
          ))}
        </select>

        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        ></textarea>

        <label>Reminder Time:</label>
        <input
          type="datetime-local"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          required
        />

        <button type="submit">Set Reminder</button>
      </form>
    </div>
  );
};

export default SetReminder;
