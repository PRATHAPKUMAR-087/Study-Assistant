import axios from "axios";
import React, { useEffect, useState } from "react";
import "../Styles/OngoingSchedules.css";

const OngoingSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const userId = sessionStorage.getItem("userUUID");

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/get-ongoing-plans?userId=${userId}`);
                setSchedules(response.data);
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        };

        fetchSchedules();
    }, [userId]);

    const handleCheckboxChange = async (userId, topic, duration, stepIndex) => {
        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule) =>
                schedule.user_id === userId && schedule.topic === topic && schedule.duration === duration
                    ? {
                          ...schedule,
                          completed_steps: schedule.completed_steps.includes(stepIndex)
                              ? schedule.completed_steps.filter((step) => step !== stepIndex)
                              : [...schedule.completed_steps, stepIndex],
                      }
                    : schedule
            )
        );
        try {
            const updatedSchedule = schedules.find(
                (s) => s.user_id === userId && s.topic === topic && s.duration === duration
            );
            const updatedSteps = updatedSchedule.completed_steps.includes(stepIndex)
                ? updatedSchedule.completed_steps.filter((step) => step !== stepIndex)
                : [...updatedSchedule.completed_steps, stepIndex];

            await axios.put("http://localhost:5000/api/update-progress", {
                user_id: userId,
                topic: topic,
                duration: duration,
                completedSteps: updatedSteps,
            });
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const markAsCompleted = async (userId, topic, duration) => {
        try {
            await axios.put("http://localhost:5000/api/complete-study", { user_id: userId, topic, duration });
            setSchedules(schedules.filter((schedule) => !(schedule.user_id === userId && schedule.topic === topic && schedule.duration === duration)));
            alert("✅ Study plan marked as completed!");
        } catch (error) {
            console.error("Error marking study plan as completed:", error);
        }
    };

    return (
        <div className="ongoing-container">
            <h2 className="page-title">Ongoing Study Schedules</h2>
            {schedules.length === 0 ? (
                <p className="no-schedules">No ongoing schedules available.</p>
            ) : (
                schedules.map((schedule) => (
                    <div key={`${schedule.user_id}-${schedule.topic}-${schedule.duration}`} className="schedule-box">
                        <div className="schedule-header">
                            <h3 className="capitalize"><strong>{schedule.topic}</strong></h3>
                        </div>
                        <table className="study-table">
                            <thead>
                                <tr>
                                    <th>Done</th>
                                    <th>Duration</th>
                                    <th>Activity</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.study_plan.map((step, index) => (
                                    <tr key={index}>
                                    <td>
                                      <label className="custom-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={schedule.completed_steps.includes(index)}
                                          onChange={() =>
                                            handleCheckboxChange(schedule.user_id, schedule.topic, schedule.duration, index)
                                          }
                                        />
                                        <span className="checkmark"></span>
                                      </label>
                                    </td>
                                    <td>{step.Duration}</td>
                                    <td>{step.Activity}</td>
                                    <td>{step.Description}</td>
                                  </tr>
                                  
                                ))}
                            </tbody>
                        </table>
                        {schedule.completed_steps.length === schedule.study_plan.length && (
                            <button className="complete-btn" onClick={() => markAsCompleted(schedule.user_id, schedule.topic, schedule.duration)}>
                                Mark as Completed
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default OngoingSchedules;
