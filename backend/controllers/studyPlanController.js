// controllers/studyPlanController.js
const db = require("../config/db");
const { get } = require("../routes/authRoutes");
const { parseMarkdownTable } = require("../utils/parseMarkdown");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const API_KEY = "wuOSFtMwGb25ITwo0DdRCOFoa99gxhN3";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

// ✅Function to save a study plan to the database
const saveStudyPlan = (req, res) => {
    const { user_id, topic, duration, study_plan, plan_type, study_mode, subtopics } = req.body;

    // 🔍 Validation checks
    if (
        !user_id || !topic || !duration || isNaN(duration) ||
        !study_plan || !plan_type || !study_mode || !subtopics
    ) {
        console.error("Missing required fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    const studyPlanText = JSON.stringify(study_plan);
    const subtopicsText = JSON.stringify(subtopics); // 🔥 Convert array to string for DB

    const query = `
        INSERT INTO study_plans (user_id, topic, duration, study_plan, plan_type, study_mode, subtopics, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(query, [user_id, topic, duration, studyPlanText, plan_type, study_mode, subtopicsText], (err, result) => {
        if (err) {
            console.error('Error inserting study plan:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }

        res.status(200).json({ message: 'Study plan saved successfully' });
    });
};


// ✅ API to get all study plans for a user
const getStudyPlans = (req, res) => {
    const userId = req.query.userId;
    const sql = `
        SELECT topic, plan_type, created_at, study_mode, study_plan 
        FROM study_plans 
        WHERE status='pending' AND user_id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching study plans:", err);
            return res.status(500).json({ message: "Failed to retrieve study plans" });
        }

        const formattedResults = results.map((row) => ({
            topic: row.topic,
            plan_type: row.plan_type,
            created_at: row.created_at,
            study_mode: row.study_mode,
            study_plan: JSON.parse(row.study_plan),
        }));

        res.json(formattedResults);
    });
};

// ✅ API to delete a study plan
const deleteStudyPlan = (req, res) => {
    //console.log("Received delete request:", req.body); // Debugging log

    const { userId, topic, created_at } = req.body;

    if (!userId || !topic || !created_at) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    function formatDate(isoString) {
        const date = new Date(isoString);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // Example usage:
    const formattedDate = formatDate(created_at) ;
     // Output: "2025-03-31 04:49:29" (assuming IST timezone)
    
    // Convert 'created_at' to MySQL DATETIME format
    //const formattedDate = new Date(created_at).toLocaleString();

    //console.log("Formatted Date:", formattedDate); // Debugging log

    const sql = "DELETE FROM study_plans WHERE user_id = ? AND topic = ? AND created_at = ?";
    db.query(sql, [userId, topic, formattedDate], (err, result) => {
        if (err) {
            console.error("Error deleting study plan:", err);
            return res.status(500).json({ message: "Failed to delete study plan." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching study plan found." });
        }

        res.json({ message: "Study plan deleted successfully!" });
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
    const { topic, duration, subtopics, planType, studyMode } = req.body;
    if (!topic || !duration || !subtopics.length || !planType || !studyMode) 
        return res.status(400).json({ error: "Missing fields: topic, duration, subtopics, planType, or studyMode." });
    
    try {
        let planInstruction = "";
        if (planType === "single") {
            planInstruction = `Create a structured study timetable for ${topic} (to be completed in ${duration} hours). Focus on the following subtopics: ${subtopics.join(", ")}. The study mode is ${studyMode}. Use a markdown table with columns: "Duration | Activity | Description". Each entry should have time durations (breakdown of total ${duration} hours) based on subtopic complexity. Include one or two breaks if necessary but not frequently. Only return the table.`;
        } else {
            planInstruction = `Create a structured study timetable for ${topic} (to be completed in ${duration} days). Focus on the following subtopics: ${subtopics.join(", ")}. The study mode is ${studyMode}. Use a markdown table with columns: "Day | Activity | Description". Each entry should be divided across ${duration} days, ensuring optimal topic coverage and revision. Don't include breaks. Only return the table.`;
        }
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral-small",
                messages: [
                    { role: "system", content: "You are a study planner assistant. Generate structured timetables by analysing subtopics." },
                    { role: "user", content: planInstruction }
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
    const { userId, topic, created_at, status } = req.body;
    function formatDate(isoString) {
        const date = new Date(isoString);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    const formattedDate = formatDate(created_at) ;
    const sql = "UPDATE study_plans SET status = ? WHERE user_id = ? AND topic = ? AND created_at = ?";

    db.query(sql, [status, userId, topic, formattedDate], (err, result) => {
        if (err) {
            console.error("Error updating study plan:", err);
            return res.status(500).json({ message: "Failed to update study plan." });
        }
        res.json({ message: "Study plan updated successfully!" });
    });
};
//✅ API to get ongoing studyplans for a user
const getOngoingPlans = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const sql = `
        SELECT user_id, topic, duration, study_plan, completed_steps, plan_type, study_mode, subtopics, created_at 
        FROM study_plans 
        WHERE status = 'ongoing' AND user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching schedules:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // ✅ Parse JSON safely
        const processedData = result.map((item) => ({
            ...item,
            study_plan: (() => {
                try {
                    return JSON.parse(item.study_plan);
                } catch (error) {
                    console.warn("⚠️ Invalid study_plan format, setting default []");
                    return [];
                }
            })(),
            completed_steps: (() => {
                try {
                    return item.completed_steps ? JSON.parse(item.completed_steps) : [];
                } catch (error) {
                    console.warn("⚠️ Invalid completed_steps format, setting default []");
                    return [];
                }
            })(),
        }));

        res.json(processedData);
    });
};

// ✅ API to Update Completed Steps for a Study Plan
const updateProgress = async (req, res) => {
    const { user_id, topic, created_at, completedSteps } = req.body;
    function formatDate(isoString) {
        const date = new Date(isoString);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    const formattedDate = formatDate(created_at) ;
    if (!user_id || !topic || !created_at) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        UPDATE study_plans 
        SET completed_steps = ? 
        WHERE user_id = ? AND topic = ? AND created_at = ?
    `;

    db.query(sql, [JSON.stringify(completedSteps), user_id, topic, formattedDate], (err, result) => {
        if (err) {
            console.error("Error updating progress:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Progress updated successfully!" });
    });
};

// ✅ API to Mark Study Plan as Completed
const completeStudy = async (req, res) => {
    const { user_id, topic, created_at } = req.body;
    function formatDate(isoString) {
        const date = new Date(isoString);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    const formattedDate = formatDate(created_at) ;

    if (!user_id || !topic || !created_at) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        UPDATE study_plans 
        SET status = 'completed', completed_steps = NULL 
        WHERE user_id = ? AND topic = ? AND created_at = ?
    `;

    db.query(sql, [user_id, topic, formattedDate], (err, result) => {
        if (err) {
            console.error("Error marking study plan as completed:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Study plan marked as completed!" });
    });
};

const generateManualPlan = async (req, res) => {
    const { subject, subTopics, duration, planType, studyMode } = req.body;
    if (!subject || !subTopics || !duration || !planType || !studyMode) 
        return res.status(400).json({ error: "Missing fields: subject, subTopics, duration, planType, or studyMode." });
    
    try {
        let planInstruction = "";
        const subtopicsArray = subTopics.split("-").map(s => s.trim());

        if (planType === "single-day") {
            planInstruction = `Create a structured study timetable for ${subject} (to be completed in ${duration} hours). Focus on the following subtopics: ${subtopicsArray.join(", ")}. The study mode is ${studyMode}. Use a markdown table with columns: "Duration | Activity | Description". Each entry should have time durations (breakdown of total ${duration} hours) based on subtopic complexity. Include one or two breaks if necessary but not frequently. Only return the table.`;
        } else {
            planInstruction = `Create a structured study timetable for ${subject} (to be completed in ${duration} days). Focus on the following subtopics: ${subtopicsArray.join(", ")}. The study mode is ${studyMode}. Use a markdown table with columns: "Day | Activity | Description". Each entry should be divided across ${duration} days, ensuring optimal topic coverage and revision. Don't include breaks. Only return the table.`;
        }
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral-small",
                messages: [
                    { role: "system", content: "You are a study planner assistant. Generate structured timetables by analysing subtopics." },
                    { role: "user", content: planInstruction }
                ],
                temperature: 0.5
            })
        });
        
        const data = await response.json();
        res.json({ studyPlan: parseMarkdownTable(data.choices[0].message.content) });
    } catch (error) {
        console.error("Error generating manual study plan:", error);
        res.status(500).json({ error: "Failed to generate manual study plan." });
    }
};

const getAllPlans = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const sql = `
        SELECT user_id, topic, duration, study_plan, completed_steps, plan_type, study_mode, status, created_at 
        FROM study_plans 
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching plans:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const processedData = result.map((item) => ({
            ...item,
            study_plan: (() => {
                try {
                    return JSON.parse(item.study_plan);
                } catch {
                    return [];
                }
            })(),
            completed_steps: (() => {
                try {
                    return item.completed_steps ? JSON.parse(item.completed_steps) : [];
                } catch {
                    return [];
                }
            })(),
        }));

        res.json(processedData);
    });
};

// controller/studyPlanController.js
const getUserPlans = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [plans] = await db.promise().query(
      'SELECT id, topic, status FROM study_plans WHERE user_id = ? AND status != "completed"',
      [userId]
    );
    res.status(200).json(plans);
  } catch (err) {
    console.error('Error fetching user plans:', err);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

module.exports = {
  getUserPlans,
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
    generateManualPlan,
    getAllPlans,
    getUserPlans
    // Add other functions here...
};