import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GenerateStudyPlan.css";

const GenerateStudyPlan = () => {
  const [topic, setTopic] = useState("");
  const [studyMode, setStudyMode] = useState("Concept Learning");
  const [planType, setPlanType] = useState("single");
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
        body: JSON.stringify({ 
          topic, 
          duration: parseInt(duration),  // Ensure duration is sent as an integer
          subtopics: selectedSubtopics, 
          planType,  // ✅ Ensure planType is sent
          studyMode 
        }),
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
      const userId = sessionStorage.getItem("userUUID");
  
      if (!userId) {
        alert("User not logged in. Please log in first.");
        return;
      }
  
      const response = await fetch("http://localhost:5000/api/save-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId,
          topic, 
          duration: parseInt(duration),
          study_plan: JSON.stringify(studyPlan),
          plan_type: planType,
          study_mode: studyMode,
          subtopics: JSON.stringify(selectedSubtopics), // ✅ Store subtopics as JSON string
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
    setStudyMode("Concept Learning");
    setPlanType("single");
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
            <h2><b>Select Study Mode:</b></h2>
            <select value={studyMode} onChange={(e) => setStudyMode(e.target.value)}>
              <option value="Concept Learning">Concept Learning (More theory)</option>
              <option value="Exam Preparation">Exam Preparation (More problem-solving) </option>
              <option value="Balanced Learning">Balanced Learning (Mix of both)</option>
            </select>
            <h2><b>Choose Plan Type:</b></h2>
            <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
              <option value="single">Single Day Plan</option>
              <option value="multiple">Multiple Day Plan</option>
            </select>
            <br />
            <button onClick={handleGetSubtopics} disabled={loading}>
              {loading ? "Fetching subtopics..." : "Proceed"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1><b>Choose the subtopics you need to study:</b></h1><br />
            <div className="subtopics-container">
              {subtopics.length > 0 ? (
                subtopics.map((sub, index) => (
                  <label className="subtopic-label" key={index}>
                    <input
                      type="checkbox"
                      value={sub}
                      onChange={(e) => {
                        setSelectedSubtopics((prev) =>
                          e.target.checked ? [...prev, sub] : prev.filter((s) => s !== sub)
                        );
                      }}
                    />
                    {sub}
                  </label>
                ))
              ) : (
                <p>No subtopics available</p>
              )}
            </div>
            <input
              type="number"
              placeholder={planType === "single" ? "Duration (hours)" : "Duration (days)"}
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
                    {Object.keys(studyPlan[0]).map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studyPlan.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No study plan available.</p>
            )}

            {/* <pre>{JSON.stringify(studyPlan, null, 2)}</pre> */}
            <button onClick={handleAddToSchedule}>Add to Schedule</button>
            <button onClick={handleGenerateAnotherPlan}>Generate Another Plan</button>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default GenerateStudyPlan;
