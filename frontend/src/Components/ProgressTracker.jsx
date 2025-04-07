import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ProgressTracker.css"; // Ensure the styles are imported

const ProgressTracker = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = sessionStorage.getItem("userUUID");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!userId) return;

            try {
                const response = await axios.get("http://localhost:5000/api/get-ongoing-plans", {
                    params: { userId: userId }
                });
                
                console.log("Fetched Data:", response.data);
                
                const processedData = response.data.map((item) => ({
                    ...item,
                    study_plan: typeof item.study_plan === "string" ? JSON.parse(item.study_plan) : item.study_plan,
                    completed_steps: Array.isArray(item.completed_steps) ? item.completed_steps : []
                }));
                
                setSchedules(processedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching progress data:", error);
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [userId]);
    
    const markAsCompleted = async (userId, topic, created_at) => {
        try {
            await axios.put("http://localhost:5000/api/complete-study", { user_id: userId, topic, created_at });
            setSchedules(schedules.filter((schedule) => !(schedule.user_id === userId && schedule.topic === topic && schedule.created_at === created_at)));
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

    if (loading) {
        return <div className="loading">Loading your study progress...</div>;
    }

    return (
        <>
        <div className="progress-container">
        <h1>Your Progress So Far</h1>
            
            {schedules.length === 0 ? (
                <p className="no-progress">No progress data available.</p>
            ) : (
                schedules.map((schedule) => {
                    const totalSteps = schedule.study_plan.length;
                    const completedSteps = schedule.completed_steps.length;
                    const progressPercentage = ((completedSteps / totalSteps) * 100).toFixed(1);
                    const progressColor = getProgressColor(progressPercentage);

                    return (
                        <div key={`${schedule.user_id}-${schedule.topic}-${schedule.created_at}`} className="progress-box">
                            <p className="topic-title">
                                {schedule.topic} - 
                                <span className={`progress-status ${progressColor}`}>
                                    {progressPercentage < 20 ? "  Needs Improvement" :
                                     progressPercentage < 50 ? "  Making Progress" :
                                     progressPercentage < 80 ? "  Almost There" : "  Great Job!"}
                                </span>
                            </p>
                            <div className="progress-bar">
                                <div className={`progress-fill ${progressColor}`} style={{ width: `${progressPercentage}%` }}>
                                    <span className="progress-text">{progressPercentage}%</span>
                                </div>
                            </div>
                            <button 
    className={`study-btn ${progressPercentage >= 100 ? "complete" : "start"}`} 
    onClick={() => {
        if (progressPercentage >= 100) {
            markAsCompleted(schedule.user_id, schedule.topic, schedule.created_at);
        } else {
            navigate("/ongoing-schedules");
        }
    }}
>
    {progressPercentage >= 100 ? "✔ Mark as Completed" : "▶ Start Studying"}
</button>

                        </div>
                    );
                })
            )}
        </div>
        </>
    );
};

export default ProgressTracker;
