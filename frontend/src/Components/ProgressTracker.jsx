import axios from "axios";
import React, { useEffect, useState } from "react";
import "../Styles/ProgressTracker.css"; // Ensure the styles are imported

const ProgressTracker = () => {
    const [schedules, setSchedules] = useState([]);
    const userId = sessionStorage.getItem("userUUID");

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!userId) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/get-ongoing-plans?userId=${userId}`);
                setSchedules(response.data);
            } catch (error) {
                console.error("Error fetching progress data:", error);
            }
        };

        fetchSchedules();
    }, [userId]);
    
    const markAsCompleted = async (userId, topic, duration) => {
        try {
            await axios.put("http://localhost:5000/api/complete-study", { user_id: userId, topic, duration });
            setSchedules(schedules.filter((schedule) => !(schedule.user_id === userId && schedule.topic === topic && schedule.duration === duration)));
            alert("✅ Study plan marked as completed!");
        } catch (error) {
            console.error("Error marking study plan as completed:", error);
        }
    };
    
    const getProgressColor = (percentage) => {
        if (percentage < 20) return "red";
        if (percentage < 50) return "orange";
        if (percentage < 80) return "yellow";
        return "blue";
    };

    return (
        <div className="progress-container">
            <h2 className="page-title">📊 Study Progress Tracker</h2>
            {schedules.length === 0 ? (
                <p className="no-progress">No progress data available.</p>
            ) : (
                schedules.map((schedule) => {
                    const totalSteps = schedule.study_plan.length;
                    const completedSteps = schedule.completed_steps.length;
                    const progressPercentage = ((completedSteps / totalSteps) * 100).toFixed(1);
                    const progressColor = getProgressColor(progressPercentage);

                    return (
                        <div key={schedule.topic} className="progress-box">
                            <p className="topic-title">
                                {schedule.topic} - 
                                <span className={`progress-status ${progressColor}`}>
                                    {progressPercentage < 20 ? "  Needs to Start" :
                                     progressPercentage < 50 ? "  Making Progress" :
                                     progressPercentage < 80 ? "  Almost There" : "  Great Job!"}
                                </span>
                            </p>
                            <div className="progress-bar">
                                <div className={`progress-fill ${progressColor}`} style={{ width: `${progressPercentage}%` }}>
                                    <span className="progress-text">{progressPercentage}%</span>
                                </div>
                            </div>
                            <button className={`study-btn ${progressPercentage >= 100 ? "complete" : "start"}`} onClick={() => markAsCompleted(schedule.user_id, schedule.topic, schedule.duration)}>
                                {progressPercentage >= 100 ? "✔ Mark as Completed" : "▶ Start Studying"}
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ProgressTracker;
