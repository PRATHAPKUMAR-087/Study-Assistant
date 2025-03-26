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
                // Get the user UUID from session storage
                const userId = sessionStorage.getItem("userUUID"); // Replace with actual method to fetch userId

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
    const startStudying = async (topic, duration) => {
        //const userId = sessionStorage.getItem("userUUID"); // Get the current user UUID from session storage

        try {
            if (!userId) {
                console.error("User UUID is missing.");
                return;
            }

            await axios.put(`http://localhost:5000/api/start-study`, { 
                userId: userId,
                topic: topic, 
                duration: duration,
                status: "ongoing" 
            });

            // Update state to reflect the change (you could optionally refetch the data)
            setSchedules((prevSchedules) =>
                prevSchedules.map((schedule) =>
                    schedule.topic === topic ? { ...schedule, status: "ongoing" } : schedule
                )
            );

            alert("✅ Study plan moved to Ongoing Schedules!");
            navigate("/ongoing-schedules"); // Redirect to Ongoing Schedules
        } catch (error) {
            console.error("Error starting study plan:", error);
        }
    };


    // Handle plan removal
    const handleRemovePlan = async (topic, duration) => {
        
        try {
            await axios.delete("http://localhost:5000/api/delete-study-plan", {
                data: { userId, topic, duration }  // Send data in the request body
            });
    
            setSchedules(schedules.filter(schedule =>
                !(schedule.user_id === userId && schedule.topic === topic && schedule.duration === duration)
            ));
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
                <p className="no-schedules">No ongoing schedules available, <Link to="/generate-study-plan">Create one</Link></p>
            ) : (
                schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-box">
                        <div className="schedule-header">
                            <h3 className="capitalize"><strong>{schedule.topic}</strong></h3>
                            <div className="schedule-actions">
                                <button className="start-btn" onClick={() => startStudying(schedule.topic,schedule.duration)}>
                                    <strong>Start Studying</strong>
                                </button>
                                <button className="delete-btn" onClick={() => handleRemovePlan(schedule.topic,schedule.duration)}>
                                    <strong>Remove Plan</strong>
                                </button><br />
                            </div>
                        </div><br />
                        <table className="study-table">
                            <thead>
                                <tr>
                                    <th>Duration</th>
                                    <th>Activity</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.study_plan.map((step, index) => (
                                    <tr key={index}> {/* Added key for child elements */}
                                        <td>{step.Duration}</td>
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
