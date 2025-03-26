// routes/studyPlanRoutes.js

const express = require("express");
const {
    saveStudyPlan,
    getStudyPlans,
    deleteStudyPlan,
    getSubtopics,
    generateStudyPlan,
    startStudy,
    getOngoingPlans,
    updateProgress, // Import the updateProgress function
    completeStudy,   // Import the completeStudy function
} = require("../controllers/studyPlanController");
//const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Define the routes
router.post('/save-study-plan', saveStudyPlan);
router.get("/get-study-plans", getStudyPlans);
router.delete("/delete-study-plan", deleteStudyPlan);
router.post("/get-subtopics", getSubtopics);
router.post("/generate-study-plan", generateStudyPlan);
router.put("/start-study", startStudy);
router.get("/get-ongoing-plans", getOngoingPlans);
router.put("/update-progress", updateProgress); // Add the update progress route
router.put("/complete-study", completeStudy);   // Add the complete study route

module.exports = router;
