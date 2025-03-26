import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GenerateStudyPlan.css";

const GenerateStudyPlan = () => {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [studyPlan, setStudyPlan] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleGetSubtopics = async () => {
    if (!topic) {
      setError("Please enter a topic first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/get-subtopics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subtopics");
      }

      const data = await response.json();
      setSubtopics(data.subtopics);
      setStep(2);
    } catch {
      setError("Failed to fetch subtopics. Please try again.");
    }

    setLoading(false);
  };

  const handleGenerateStudyPlan = async () => {
    if (!duration || selectedSubtopics.length === 0) {
      setError("Please select at least one subtopic and enter duration.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, duration, subtopics: selectedSubtopics }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }

      const data = await response.json();
      setStudyPlan(data.studyPlan);
      setStep(3);
    } catch {
      setError("Failed to generate study plan. Please try again.");
    }

    setLoading(false);
  };

  const handleAddToSchedule = async () => {
    try {
      const userId = sessionStorage.getItem("userUUID"); // Assuming the user's UUID is stored here
  
      if (!userId) {
        alert("User not logged in. Please log in first.");
        return;
      }
  
      const response = await fetch("http://localhost:5000/api/save-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // Use userId (UUID) instead of username
          topic,
          duration,
          studyPlan,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save study plan");
      }
  
      alert("Study plan added to schedule successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleGenerateAnotherPlan = () => {
    setTopic("");
    setDuration("");
    setStudyPlan([]);
    setSubtopics([]);
    setSelectedSubtopics([]);
    setError("");
    setStep(1);
  };

  return (
    <div className="study-plan-container">
      <div className="study-plan-card">
        {/* <h1>Generate Study Plan</h1> */}

        {error && <p className="error-message">{error}</p>}

        {step === 1 && (
          <>
            <h1><b>Enter the topic you need to study:</b></h1><br />
            <input
              type="text"
              placeholder="Enter Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <br />
            <button onClick={handleGetSubtopics} disabled={loading}>
              {loading ? "Fetching subtopics..." : "Proceed"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1><b>Choose the subtopics you need to study:</b></h1><br />
            <div className="subtopics-container" style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", width: "100%", maxWidth: "600px", margin: "auto", fontSize: "1.2rem" }}>
              {subtopics.length > 0 ? (
                subtopics.map((sub, index) => (
                  <label key={index} className="d-flex align-items-center p-2 rounded" style={{ backgroundColor: "#eef2f7", cursor: "pointer", transition: "background 0.3s ease" }}>
                    <input
                      type="checkbox"
                      value={sub}
                      onChange={(e) => {
                        setSelectedSubtopics((prev) =>
                          e.target.checked ? [...prev, sub] : prev.filter((s) => s !== sub)
                        );
                      }}
                      className="form-check-input"
                      style={{ width: "18px", height: "18px", marginRight: "10px", cursor: "pointer" }}
                    />
                    <span className="fw-medium text-dark">{sub}</span>
                  </label>
                ))
              ) : (
                <p>No subtopics available</p>
              )}
            </div>
            <input
              type="number"
              placeholder="Duration (hours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <button onClick={handleGenerateStudyPlan} disabled={loading}>
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </>
        )}

        {step === 3 && (
          <div>
            <h3>Your Study Plan:</h3>
            {studyPlan.length > 0 ? (
              <table className="study-plan-table">
                <thead>
                  <tr>
                    <th>Duration (hrs)</th>
                    <th>Activity</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {studyPlan.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Duration}</td>
                      <td>{item.Activity}</td>
                      <td>{item.Description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No study plan available</p>
            )}
            <div className="button-group">
              <button onClick={handleAddToSchedule}>Add to Schedule</button>
              <button onClick={handleGenerateAnotherPlan}>Generate Another Plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateStudyPlan;
