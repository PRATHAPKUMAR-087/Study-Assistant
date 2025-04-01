import axios from "axios";
import React, { useEffect, useState } from "react";
import "../Styles/OngoingSchedules.css";

const OngoingSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = sessionStorage.getItem("userUUID");
    const [visibleDetails, setVisibleDetails] = useState({});


    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (!userId) {
                    console.error("User UUID is missing.");
                    return;
                }
                const response = await axios.get("http://localhost:5000/api/get-ongoing-plans", {
                    params: { userId: userId }
                });
                
                console.log("Fetched Data:", response.data);
                
                const processedData = response.data.map((item) => ({
                    ...item,
                    study_plan: typeof item.study_plan === "string" ? JSON.parse(item.study_plan) : item.study_plan
                }));
                
                setSchedules(processedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching schedules:", error);
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);
    const toggleDetails = (topic, createdAt) => {
        setVisibleDetails((prevDetails) => ({
            ...prevDetails,
            [`${topic}-${createdAt}`]: !prevDetails[`${topic}-${createdAt}`],  // Toggle visibility
        }));
    };
    
    const handleCheckboxChange = async (userId, topic, stepIndex) => {
        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule) =>
                schedule.user_id === userId && schedule.topic === topic
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
                (s) => s.user_id === userId && s.topic === topic
            );
            const updatedSteps = updatedSchedule.completed_steps.includes(stepIndex)
                ? updatedSchedule.completed_steps.filter((step) => step !== stepIndex)
                : [...updatedSchedule.completed_steps, stepIndex];

            await axios.put("http://localhost:5000/api/update-progress", {
                user_id: userId,
                topic: topic,
                created_at: updatedSchedule.created_at,
                completedSteps: updatedSteps,
            });
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const markAsCompleted = async (userId, topic, created_at) => {
        try {
            await axios.put("http://localhost:5000/api/complete-study", { user_id: userId, topic, created_at });
            setSchedules(schedules.filter((schedule) => !(schedule.user_id === userId && schedule.topic === topic && schedule.created_at === created_at)));
            alert("✅ Study plan marked as completed!");
        } catch (error) {
            console.error("Error marking study plan as completed:", error);
        }
    };

    if (loading) {
        return <div className="loading">Loading your ongoing study plans...</div>;
    }

    return (
        <div className="ongoing-container">
            <h1>Ongoing Study Schedules</h1>
            {schedules.length === 0 ? (
                <p className="no-schedules">No ongoing schedules available.</p>
            ) : (
                schedules.map((schedule) => (
                    <div key={`${schedule.user_id}-${schedule.topic}-${schedule.created_at}`} className="schedule-box">
                        <div className="schedule-header">
                            <h3 className="capitalize"><strong>{schedule.topic}</strong></h3>
                            
                            {/* View Plan Details Button */}
                            <button 
                                className="view-details-btn" 
                                onClick={() => toggleDetails(schedule.topic, schedule.created_at)}
                            >
                                {visibleDetails[`${schedule.topic}-${schedule.created_at}`] ? "Hide Plan Details" : "View Plan Details"}
                            </button>
                            
                            {/* Conditionally render plan details */}
                            {visibleDetails[`${schedule.topic}-${schedule.created_at}`] && (
                                <div className="plan-details">
                                    <p><strong>Plan Type:</strong> {schedule.plan_type}</p>
                                    <p><strong>Created On:</strong> {new Date(schedule.created_at).toLocaleString()}</p>
                                    <p><strong>Study Mode:</strong> {schedule.study_mode}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Table for the study plan */}
                        <table className="study-table">
                            <thead>
                                <tr>
                                    <th>Done</th>
                                    <th>{schedule.plan_type === "multiple" ? "Day" : "Duration"}</th>
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
                                                    onChange={() => handleCheckboxChange(schedule.user_id, schedule.topic, index)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </td>
                                        <td>
                                            {schedule.plan_type === "multiple" ? 
                                                (step.Day ? `${step.Day}` : `Day ${index + 1}`) : 
                                                step.Duration || "N/A"}
                                        </td>
                                        <td>{step.Activity}</td>
                                        <td>{step.Description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
    
                        {/* Mark as completed button */}
                        {schedule.completed_steps.length === schedule.study_plan.length && (
                            <button className="complete-btn" onClick={() => markAsCompleted(schedule.user_id, schedule.topic, schedule.created_at)}>
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
