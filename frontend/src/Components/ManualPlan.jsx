import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GenerateStudyPlan.css";

const ManualPlan = () => {
  const [formData, setFormData] = useState({
    subject: "",
    subTopics: "",
    duration: "",
    planType: "single",
    studyMode: "Balanced-learning",
  });
  const [studyPlan, setStudyPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.subTopics || !formData.duration) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/generate-manual-plan", formData);
      setStudyPlan(response.data.studyPlan);
      setStep(2);
    } catch (error) {
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

      await axios.post("http://localhost:5000/api/save-study-plan", {
        user_id: userId,
        topic: formData.subject,
        duration: parseInt(formData.duration),
        study_plan: JSON.stringify(studyPlan),
        plan_type: formData.planType,
        study_mode: formData.studyMode,
      });

      alert("Study plan added to schedule successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Error saving study plan. Please try again.");
    }
  };

  return (
    <div className="study-plan-container">
      <div className="study-plan-card">
        {error && <p className="error-message">{error}</p>}

        {step === 1 && (
          <>
            <h1>Create Manual Study Plan</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject or Topic"
                required
              />
              <input
                type="text"
                name="subTopics"
                value={formData.subTopics}
                onChange={handleChange}
                placeholder="Sub-topics (separated by hyphen)"
                required
              />
              <select name="planType" value={formData.planType} onChange={handleChange}>
                <option value="single">Single Day</option>
                <option value="multiple">Multiple Day</option>
              </select>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder={formData.planType === "single-day" ? "Duration (hours)" : "Duration (days)"}
                required
              />
              <select name="studyMode" value={formData.studyMode} onChange={handleChange}>
                <option value="Balanced Learning">Balanced Learning</option>
                <option value="Concept Learning">Concept Learning</option>
                <option value="Exam Preparation">Exam Preparation</option>
              </select>
              <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Study Plan"}</button>
            </form>
          </>
        )}

        {step === 2 && (
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
            <button onClick={handleAddToSchedule}>Add to Schedule</button>
            <button onClick={() => setStep(1)}>Generate Another Plan</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualPlan;
