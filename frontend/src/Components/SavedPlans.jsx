import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/SavedPlans.css";

const SavedPlans = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);  // Loading state
    const navigate = useNavigate();
    const userId = sessionStorage.getItem("userUUID");


    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (!userId) {
                    console.error("User UUID is missing.");
                    return;
                }

                const response = await axios.get("http://localhost:5000/api/get-study-plans", {
                    params: { userId: userId }  // Pass the userId as a query parameter
                });

                console.log("Fetched Data:", response.data);

                // Process data and filter out ongoing study plans
                const processedData = response.data
                    .map((item) => ({
                        ...item,
                        study_plan: typeof item.study_plan === "string" ? JSON.parse(item.study_plan) : item.study_plan
                    }))
                    .filter((item) => item.status !== "ongoing");

                setSchedules(processedData);
                setLoading(false);  // Data is loaded, stop loading state
            } catch (error) {
                console.error("Error fetching schedules:", error);
                setLoading(false);  // Stop loading in case of an error
            }
        };

        fetchSchedules();
    }, []);

    // Function to move study plan to "Ongoing Schedules"
    const startStudying = async (topic, createdAt) => {
        try {
            if (!userId) {
                console.error("User UUID is missing.");
                return;
            }

            await axios.put(`http://localhost:5000/api/start-study`, {
                userId: userId,
                topic: topic,
                created_at: createdAt,  // Use created_at instead of duration
                status: "ongoing"
            });

            // Update UI state
            setSchedules((prevSchedules) =>
                prevSchedules.map((schedule) =>
                    schedule.topic === topic && schedule.created_at === createdAt
                        ? { ...schedule, status: "ongoing" }
                        : schedule
                )
            );

            alert("✅ Study plan moved to Ongoing Schedules!");
            navigate("/ongoing-schedules");
        } catch (error) {
            console.error("Error starting study plan:", error);
        }
    };

    // ✅ Handle Remove Plan
    const handleRemovePlan = async (topic, created_at) => {
        try {
            //console.log("Before deletion:", schedules);

            await axios.delete("http://localhost:5000/api/delete-study-plan", {
                data: { userId, topic, created_at }
            });

            setSchedules((prevSchedules) =>
                prevSchedules.filter(schedule =>
                    !(schedule.topic === topic && schedule.created_at === created_at)
                )
            );

            //console.log("After deletion:", schedules); // Check if schedules are updating
        } catch (error) {
            console.error("Error deleting study plan:", error);
        }
    };
    if (loading) {
        return <div className="loading">Loading your study plans...</div>; // Display loading message
    }

    return (
        <div className="saved-container">
            <h2 className="page-title">Created Study Schedules</h2>
            {schedules.length === 0 ? (
                <p className="no-schedules">No Schedules available, <Link to="/generate-study-plan">Create one</Link></p>
            ) : (
                schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-box">
                        <div className="schedule-header">
                            <h3 className="capitalize"><strong>{schedule.topic}</strong></h3>
                            <p><strong>Plan Type:</strong> {schedule.plan_type}</p>
                            <p><strong>Created At:</strong> {new Date(schedule.created_at).toLocaleString()}</p>
                            <p><strong>Study Mode:</strong> {schedule.study_mode}</p>
                            <div className="schedule-actions">
                                <button className="start-btn" onClick={() => startStudying(schedule.topic, schedule.created_at)}>
                                    <strong>Start Studying</strong>
                                </button>
                                <button className="delete-btn" onClick={() => handleRemovePlan(schedule.topic, schedule.created_at)}>
                                    <strong>Remove Plan</strong>
                                </button><br />
                            </div>
                        </div><br />
                        <table className="study-table">
                            <thead>
                                <tr>
                                    <th>{schedule.plan_type === "multiple" ? "Day" : "Duration"}</th>
                                    <th>Activity</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.study_plan.map((step, index) => (
                                    <tr key={index}>
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

                    </div>
                ))
            )}
        </div>
    );
};

export default SavedPlans;
