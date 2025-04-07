import axios from "axios";
import React, { useEffect, useState } from "react";
import "../Styles/OngoingSchedules.css";

const OngoingSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleDetails, setVisibleDetails] = useState({});
    const [selectedResources, setSelectedResources] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const userId = sessionStorage.getItem("userUUID");

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (!userId) return;
                const response = await axios.get("http://localhost:5000/api/get-ongoing-plans", {
                    params: { userId }
                });

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
        setVisibleDetails(prev => ({
            ...prev,
            [`${topic}-${createdAt}`]: !prev[`${topic}-${createdAt}`],
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
                topic,
                created_at: updatedSchedule.created_at,
                completedSteps: updatedSteps,
            });
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const viewSavedResources = async (schedule) => {
        try {
            const response = await axios.get("http://localhost:5000/api/view-resources", {
                params: {
                    user_id: schedule.user_id,
                    topic: schedule.topic,
                    created_at: schedule.created_at,
                },
            });

            setSelectedResources(response.data);
            console.log("Selected resources:", response.data);

            setShowPopup(true);
        } catch (error) {
            console.error("Error fetching saved resources:", error);
        }
    };

    const markAsCompleted = async (userId, topic, created_at) => {
        try {
            await axios.put("http://localhost:5000/api/complete-study", { user_id: userId, topic, created_at });
            setSchedules(schedules.filter((s) => !(s.user_id === userId && s.topic === topic && s.created_at === created_at)));
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
                schedules.map((schedule) => {
                    const baseKey = `${schedule.topic}-${schedule.created_at}`;

                    return (
                        <div key={`${schedule.user_id}-${schedule.topic}-${schedule.created_at}`} className="schedule-box">
                            <div className="schedule-header">
                                <h3 className="capitalize"><strong>{schedule.topic}</strong></h3>

                                <button className="view-details-btn" onClick={() => toggleDetails(schedule.topic, schedule.created_at)}>
                                    {visibleDetails[baseKey] ? "Hide Plan Details" : "View Plan Details"}
                                </button>

                                <button className="view-saved-btn" onClick={() => viewSavedResources(schedule)}>
                                    View Saved Resources
                                </button>
                            </div>

                            {visibleDetails[baseKey] && (
                                <div className="plan-details">
                                    <p><strong>Plan Type:</strong> {schedule.plan_type}</p>
                                    <p><strong>Created On:</strong> {new Date(schedule.created_at).toLocaleString()}</p>
                                    <p><strong>Study Mode:</strong> {schedule.study_mode}</p>
                                </div>
                            )}

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
                                                {schedule.plan_type === "multiple" ? (step.Day || `Day ${index + 1}`) : step.Duration || "N/A"}
                                            </td>
                                            <td>{step.Activity}</td>
                                            <td>{step.Description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {schedule.completed_steps.length === schedule.study_plan.length && (
                                <button className="complete-btn" onClick={() => markAsCompleted(schedule.user_id, schedule.topic, schedule.created_at)}>
                                    Mark as Completed
                                </button>
                            )}
                        </div>
                    );
                })
            )}

{showPopup && selectedResources && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3 className="text-xl font-semibold justify-center mb-4">📚 Saved Resources</h3>

      {selectedResources.map((resource, index) => {
        const { resource_type, subtopic, content } = resource;

        return (
          <div key={index} className="mb-6 border-b pb-4">
            <p className="text-lg font-medium mb-1">📌 <span className="font-semibold">Subtopic:</span> {subtopic}</p>
            <p className="text-sm text-gray-700 mb-2">🧠 <span className="font-medium">Type:</span> {resource_type}</p>

            {resource_type === "explanation" && (
              <div className="bg-gray-100 p-3 rounded text-gray-800 text-sm whitespace-pre-wrap">
                {content}
              </div>
            )}

            {Array.isArray(content) && content.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-gray-800">🔗 Resources:</p>
                <ul className="list-disc pl-6 text-blue-600 text-sm">
                  {content.map((url, idx) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noreferrer" className="hover:underline">
                        {url.includes("youtube.com") ? "🎥 YouTube Video" : url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

<div className="flex justify-center mt-6">
  <button
    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded w-[200px] text-center"
    onClick={() => setShowPopup(false)}
  >
    ❌ Close
  </button>
</div>



    </div>
  </div>
)}

        </div>
    );
};

export default OngoingSchedules;
