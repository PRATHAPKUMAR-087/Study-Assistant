import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import "../Styles/OngoingSchedules.css";

const OngoingSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleDetails, setVisibleDetails] = useState({});
    const [selectedResources, setSelectedResources] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [quizPopup, setQuizPopup] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [activeSchedule, setActiveSchedule] = useState(null);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);



    const userId = sessionStorage.getItem("userUUID");
    const navigate = useNavigate();

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
                validateStatus: (status) => status < 500
            });

            const data = response.data;

            if (!data || data.length === 0 || response.status === 404) {
                const confirmRedirect = window.confirm(
                    "⚠️ No resources found for this topic. Do you want to generate resources now?"
                );
                if (confirmRedirect) {
                    navigate("/study-resources");
                }
                return;
            }

            setSelectedResources(data);
            setShowPopup(true);
        } catch (error) {
            console.error("Error fetching saved resources:", error);
        }
    };

    const handleGenerateQuiz = async (userId, topic, subtopics, created_at) => {
        try {
            const res = await axios.post("http://localhost:5000/api/generate-quiz", { user_id: userId, topic, subtopics, created_at });
            if (res.data && res.data.quiz) {
                setQuizData(res.data.quiz);
                setQuizPopup("start");
            } else {
                alert("Quiz generation failed.");
            }
        } catch (error) {
            console.error("Quiz generation error:", error);
        }
    };

    const handleAnswer = (answer) => {
        setUserAnswers([...userAnswers, answer]);
        if (currentQuestionIndex + 1 < quizData.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Calculate score
            let correct = 0;
            quizData.forEach((q, i) => {
                if (q.answer === userAnswers[i]) correct++;
            });
            setScore(correct);
            setQuizPopup("finished");
        }
    };

    const handleCompleteFlow = async (schedule) => {
        setActiveSchedule(schedule); // ✅ Save current schedule
        if (!quizData) await handleGenerateQuiz(schedule.user_id, schedule.topic, schedule.subtopics, schedule.created_at);
        setQuizPopup("options");
    };

    const handleFinalMarkComplete = async (schedule) => {
        if (!schedule) return alert("❗ No schedule selected.");
        try {
            await axios.put("http://localhost:5000/api/complete-study", {
                user_id: schedule.user_id,
                topic: schedule.topic,
                created_at: schedule.created_at,
            });
            setSchedules(schedules.filter((s) => !(s.user_id === schedule.user_id && s.topic === schedule.topic && s.created_at === schedule.created_at)));
            alert("✅ Study plan marked as completed!");
            setQuizPopup(null); // close quiz popup
            setQuizData(null);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setScore(null);
            setActiveSchedule(null);
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
                                        <th>{schedule.plan_type === "multiple" ? "Day" : "Duration"}</th>
                                        <th>Activity</th>
                                        <th>Description</th>
                                        <th>Done</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.study_plan.map((step, index) => (
                                        <tr key={index}>
                                            <td>
                                                {schedule.plan_type === "multiple" ? (step.Day || `Day ${index + 1}`) : step.Duration || "N/A"}
                                            </td>
                                            <td>{step.Activity}</td>
                                            <td>{step.Description}</td>
                                            <td>
                                                <label className="custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule.completed_steps.includes(index)}
                                                        onChange={() => handleCheckboxChange(schedule.user_id, schedule.topic, index)}
                                                    />
                                                    <span className="checkbox-text">
                                                        {schedule.completed_steps.includes(index) ? "completed" : "complete"}
                                                    </span>
                                                </label>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <br />

                            {schedule.completed_steps.length === schedule.study_plan.length && (
                                <button
                                    className="complete-btn"
                                    onClick={async () => {
                                        setIsMarkingComplete(true);
                                        await handleCompleteFlow(schedule); // wait until the process is done
                                        setIsMarkingComplete(false);
                                    }}
                                    disabled={isMarkingComplete}
                                >
                                    {isMarkingComplete ? "Please wait..." : "Mark as Completed"}
                                </button>

                            )}
                        </div>
                    );
                })
            )}

            {quizPopup === "options" && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>🎯 Take a small quiz to test yourself</h3>
                        <button onClick={() => setQuizPopup("start")}>Take Quiz</button>
                        <button onClick={() => handleFinalMarkComplete(activeSchedule)}>
                            Skip Quiz and Mark as Completed
                        </button>                    </div>
                </div>
            )}

            {quizPopup === "start" &&
                quizData?.[currentQuestionIndex] &&
                quizData[currentQuestionIndex].options && (
                    <div className="popup-overlay1">
                        <div className="popup-content1">
                            <h3>📝 Quiz</h3>
                            <p>{quizData[currentQuestionIndex].question}</p>

                            {Object.entries(quizData[currentQuestionIndex].options).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handleAnswer(key)} // Pass "A", "B", etc.
                                    >
                                    <strong>{key}.</strong> {value}
                                </button>
                            ))}
                        </div>
                    </div>
                )}




            {quizPopup === "finished" && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>🎉 Quiz Completed!</h3>
                        <p>Your Score: {score} / {quizData.length}</p>
                        <button onClick={() => handleFinalMarkComplete(activeSchedule)}>
                            Mark as Completed
                        </button>

                    </div>
                </div>
            )}

            {showPopup && selectedResources && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3 className="popup-title">📚 Saved Resources</h3>
                        {selectedResources.map((resource, index) => {
                            const { resource_type, subtopic, content } = resource;
                            return (
                                <div key={index} className="resource-block">
                                    <p className="subtopic-text">📌 <strong>Subtopic:</strong> {subtopic}</p>
                                    {resource_type === "explanation" && (
                                        <div className="explanation-box">
                                            <ReactMarkdown components={{ ol: (props) => <div {...props} />, ul: (props) => <div {...props} />, li: (props) => <div {...props} /> }}>{content}</ReactMarkdown>
                                        </div>
                                    )}
                                    {Array.isArray(content) && content.length > 0 && (
                                        <div className="resource-links-section">
                                            <p className="resource-heading">🔗 Resources:</p>
                                            <ul className="resource-list no-bullets" style={{ listStyleType: "none", paddingLeft: 0 }}>
                                                {content.map((item, idx) => {
                                                    const url = typeof item === "string" ? item : item.url;
                                                    const title = typeof item === "string" ? (item.includes("youtube.com") ? "🎥 YouTube Video" : url) : item.title || (url.includes("youtube.com") ? "🎥 YouTube Video" : url);
                                                    return (
                                                        <li key={idx}>
                                                            <a href={url} target="_blank" rel="noreferrer" className="resource-link">
                                                                {url.includes("youtube.com") ? "🎥 " : "📎 "}
                                                                {title}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="popup-footer">
                            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>❌ Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OngoingSchedules;
