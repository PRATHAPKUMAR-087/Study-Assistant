// controllers/studyPlanController.js
const db = require("../config/db");
const { parseMarkdownTable } = require("../utils/parseMarkdown");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const API_KEY = "wuOSFtMwGb25ITwo0DdRCOFoa99gxhN3";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

// ✅Function to save a study plan to the database
const saveStudyPlan = (req, res) => {
    const { userId, topic, duration, studyPlan } = req.body;

    const studyPlanText = JSON.stringify(studyPlan);  // Convert study plan to string

    const query = `
    INSERT INTO study_plans (user_id, topic, duration, study_plan, status) 
    VALUES (?, ?, ?, ?, 'pending')`;

    db.query(query, [userId, topic, duration, studyPlanText], (err, result) => {
        if (err) {
            console.error('Error inserting study plan:', err);
            return res.status(500).json({ error: 'Failed to save study plan' });
        }

        res.status(200).json({ message: 'Study plan saved successfully' });
    });
};

// ✅ API to get all study plans for a user
const getStudyPlans = (req, res) => {
    const userId = req.query.userId;
    const sql = "SELECT * FROM study_plans WHERE status='pending' and user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching study plans:", err);
            return res.status(500).json({ message: "Failed to retrieve study plans" });
        }

        const formattedResults = results.map((row) => ({
            ...row,
            study_plan: JSON.parse(row.study_plan),
        }));

        res.json(formattedResults);
    });
};

// ✅ API to delete a study plan
const deleteStudyPlan = (req, res) => {
    const { userId, topic, duration } = req.body;
    if (!userId || !topic || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "DELETE FROM study_plans WHERE user_id = ? AND topic = ? AND duration = ?";

    db.query(sql, [userId, topic, duration], (err, result) => {
        if (err) {
            console.error("Error deleting study plan:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching study plan found" });
        }

        res.json({ message: "Study plan deleted successfully" });
    });
};

// ✅ API to get subtopics for a given topic
const getSubtopics = async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required." });
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral-small",
                messages: [
                    { role: "system", content: "You are an expert study planner. Suggest subtopics." },
                    { role: "user", content: `List the key subtopics for ${topic} as a simple JSON array.` }
                ],
                temperature: 0.5
            })
        });
        const data = await response.json();
        res.json({ subtopics: JSON.parse(data.choices[0].message.content) });
    } catch (error) {
        console.error("Error getting subtopics:", error);
        res.status(500).json({ error: "Failed to fetch subtopics." });
    }
};

// ✅ API to generate a study plan based on user input
const generateStudyPlan = async (req, res) => {
    const { topic, duration, subtopics } = req.body;
    if (!topic || !duration || !subtopics.length) return res.status(400).json({ error: "Missing fields: topic, duration, or subtopics." });
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral-small",
                messages: [
                    { role: "system", content: "You are a study planner assistant. Generate structured timetables." },
                    { role: "user", content: `Create a structured study timetable for ${topic} (to be completed in ${duration} hours). Focus on the following subtopics: ${subtopics.join(", ")}. Use a markdown table with columns: "Duration | Activity | Description". Each entry should have time durations like '15 mins', '30 mins', etc. Only return the table.` }
                ],
                temperature: 0.5
            })
        });
        const data = await response.json();
        res.json({ studyPlan: parseMarkdownTable(data.choices[0].message.content) });
    } catch (error) {
        console.error("Error generating study plan:", error);
        res.status(500).json({ error: "Failed to generate study plan." });
    }
};

// ✅ API to update the status of a study plan to 'ongoing' and start studying
const startStudy = async (req, res) => {
    const { userId, duration, topic } = req.body; // Get from the request body (use query params if needed)

    try {
        // Ensure that userUUID and topic are provided
        if (!userId || !topic || !duration) {
            return res.status(400).json({ error: "User ID and topic are required." });
        }

        // Update the status of the study plan to 'ongoing' based on userUUID and topic
        const updateQuery = "UPDATE study_plans SET status = 'ongoing', duration = ? WHERE user_id = ? AND topic = ?";
        const [result] = await db.promise().query(updateQuery, [duration, userId, topic]);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Study plan not found for the specified user and topic." });
        }

        // Respond with a success message
        res.status(200).json({ message: "Study plan moved to ongoing schedules." });
    } catch (error) {
        console.error("Error updating study plan status:", error);
        res.status(500).json({ error: "Failed to update study plan status." });
    }
};
//✅ API to get ongoing studyplans for a user
const getOngoingPlans = async (req, res) => {
    const { userId } = req.query; // Get userId from frontend request (query params)

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const sql = "SELECT user_id, topic, duration, study_plan, completed_steps FROM study_plans WHERE status = 'ongoing' AND user_id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching schedules:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // ✅ Fix JSON parsing for `completed_steps`
        const processedData = result.map((item) => ({
            ...item,
            study_plan: JSON.parse(item.study_plan),
            completed_steps: (() => {
                try {
                    return item.completed_steps ? JSON.parse(item.completed_steps) : [];
                } catch (error) {
                    //console.warn("⚠️ Invalid completed_steps format, setting default []");
                    return [];
                }
            })(),
        }));

        res.json(processedData);
    });
};

// ✅ API to Update Completed Steps for a Study Plan
const updateProgress = async (req, res) => {
    const { user_id, topic, duration, completedSteps } = req.body;

    const sql = "UPDATE study_plans SET completed_steps = ? WHERE user_id = ? AND topic = ? AND duration = ?";

    db.query(sql, [JSON.stringify(completedSteps), user_id, topic, duration], (err, result) => {
        if (err) {
            console.error("Error updating progress:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Progress updated successfully!" });
    });
};

// ✅ API to Mark Study Plan as Completed
const completeStudy = async (req, res) => {
    const { user_id, topic, duration } = req.body;
    const sql = "UPDATE study_plans SET status = 'completed', completed_steps = NULL WHERE user_id = ? AND topic = ? AND duration = ?";

    db.query(sql, [user_id, topic, duration], (err, result) => {
        if (err) {
            console.error("Error marking study plan as completed:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Study plan marked as completed!" });
    });
};

module.exports = {
    saveStudyPlan,
    getStudyPlans,
    deleteStudyPlan,
    getSubtopics,
    generateStudyPlan,
    startStudy,
    getOngoingPlans,
    updateProgress,
    completeStudy,
    // Add other functions here...
};