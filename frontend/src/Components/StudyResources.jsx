import axios from "axios";
import React, { useEffect, useState } from "react";
import "../Styles/StudyResources.css";

const StudyResources = () => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [resources, setResources] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [loadingResources, setLoadingResources] = useState(false);
    const [lastGeneratedType, setLastGeneratedType] = useState(""); // ✅ Track selected type

    const userId = sessionStorage.getItem("userUUID");

    useEffect(() => {
        const fetchOngoingPlans = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/get-ongoing-plans", {
                    params: { userId }
                });
                setPlans(response.data);
            } catch (err) {
                console.error("❌ Failed to fetch plans:", err);
            }
        };

        if (userId) {
            fetchOngoingPlans();
        }
    }, [userId]);

    const getPlanKey = (plan) => `${plan.topic}_${plan.created_at}`;

    const fetchResources = async (resourceType) => {
        if (!selectedPlan) return;

        let subTopics = [];

        try {
            let raw = selectedPlan.subtopics;
            if (typeof raw === "string" && raw.startsWith('"[')) {
                raw = JSON.parse(raw);
                subTopics = JSON.parse(raw);
            } else if (typeof raw === "string") {
                subTopics = JSON.parse(raw);
            } else {
                subTopics = raw;
            }

            console.log("📦 Final parsed subtopics:", subTopics);
        } catch (err) {
            console.error("❌ Error parsing subtopics:", err);
            return;
        }

        try {
            setLoadingResources(true);

            const response = await axios.post("http://localhost:5000/api/get-resources", {
                sub_topics: subTopics,
                resource_type: resourceType,
            });

            const planKey = getPlanKey(selectedPlan);

            setResources(prev => ({
                ...prev,
                [planKey]: {
                    ...(prev[planKey] || {}),
                    [resourceType]: response.data
                }
            }));

            setLastGeneratedType(resourceType); // ✅ Store selected type
        } catch (err) {
            console.error("❌ Error fetching resources:", err);
        } finally {
            setLoadingResources(false);
            setShowPopup(false);
        }
    };

    const handleResourceTypeSelect = (type) => {
        fetchResources(type);
    };

    const handleSaveResources = async () => {
        if (!selectedPlan || !lastGeneratedType) {
            alert("⚠️ Please generate a resource first.");
            return;
        }

        const planKey = getPlanKey(selectedPlan);
        const generatedResources = resources[planKey];

        if (!generatedResources || !generatedResources[lastGeneratedType]) {
            alert("⚠️ No resources found for the selected type.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/save-resources", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    topic: selectedPlan.topic,
                    created_at: selectedPlan.created_at,
                    type: lastGeneratedType,
                    resources: generatedResources[lastGeneratedType]
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ Resources saved successfully!");
            } else {
                alert(`❌ Failed to save: ${data.error}`);
            }
        } catch (err) {
            console.error("Frontend save error:", err);
            alert("❌ Error saving resources");
        }
    };

    const renderSubtopics = () => {
        try {
            let raw = selectedPlan.subtopics;

            if (typeof raw === "string" && raw.startsWith('"[')) {
                raw = JSON.parse(raw);
                raw = JSON.parse(raw);
            } else if (typeof raw === "string") {
                raw = JSON.parse(raw);
            }

            return Array.isArray(raw) ? raw.join(", ") : "N/A";
        } catch (err) {
            console.error("❌ Error rendering subtopics:", err);
            return "N/A";
        }
    };

    const planKey = selectedPlan ? getPlanKey(selectedPlan) : null;
    const currentResources = planKey ? resources[planKey] : null;

    return (
        <div className="resources-container">
            <h2>📚 Study Resources</h2>

            {!selectedPlan ? (
                <>
                    <h3>Select a Plan to View Resources</h3>
                    <div className="plan-card-container">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className="plan-card"
                                onClick={() => setSelectedPlan(plan)}
                            >
                                <h4>{plan.topic.charAt(0).toUpperCase() + plan.topic.slice(1)}</h4>
                                <p><strong>Created On:</strong> {new Date(plan.created_at).toLocaleDateString()}</p>
                                <p><strong>Duration:</strong> {plan.duration} days</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="plan-details-box">
                        <h3>📌 Plan Details</h3>
                        <p><strong>Topic:</strong> {selectedPlan.topic}</p>
                        <p><strong>Created At:</strong> {new Date(selectedPlan.created_at).toLocaleString()}</p>
                        <p><strong>Study Mode:</strong> {selectedPlan.study_mode}</p>
                        <p><strong>Plan Type:</strong> {selectedPlan.plan_type}</p>
                        <p><strong>Subtopics:</strong> {renderSubtopics()}</p>
                        <button onClick={() => setSelectedPlan(null)}>⬅️ Back to Plan List</button>
                    </div>

                    <div className="actions">
                        <button onClick={() => setShowPopup(true)}>➕ Generate Resources</button>
                        <button onClick={handleSaveResources} disabled={!currentResources}>
                            💾 Save Resources
                        </button>
                    </div>

                    {currentResources && (
                        <div className="generated-resources">
                            <h3>Generated Resources</h3>
                            {loadingResources ? (
                                <p>Loading...</p>
                            ) : (
                                Object.entries(currentResources).map(([type, data]) => (
                                    <div key={type} className="resource-block">
                                        <h4>🔹 {type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                                        {Object.entries(data).map(([sub, content]) => (
                                            <div key={sub}>
                                                <p><strong>Sub-topic:</strong> {sub}</p>
                                                {type === "notes" && <p>{content.explanation}</p>}
                                                {type === "articles" && (
                                                    <ul>
                                                        {content.suggestions.map((url, idx) => (
                                                            <li key={idx}><a href={url} target="_blank" rel="noreferrer">{url}</a></li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {type === "videos" && (
                                                    <ul>
                                                        {content.videos.map((video, idx) => (
                                                            <li key={idx}><a href={video.url} target="_blank" rel="noreferrer">{video.title}</a></li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <h3>Select Resource Type</h3>
                                <button onClick={() => handleResourceTypeSelect("notes")}>📘 AI Notes</button>
                                <button onClick={() => handleResourceTypeSelect("articles")}>📄 Articles</button>
                                <button onClick={() => handleResourceTypeSelect("videos")}>🎥 YouTube Videos</button>
                                <button className="close-btn" onClick={() => setShowPopup(false)}>❌ Cancel</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudyResources;
