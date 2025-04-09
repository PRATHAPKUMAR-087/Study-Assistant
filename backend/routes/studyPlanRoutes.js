const express = require("express");
const {
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
    getUserPlans, // ✅ Already imported correctly
} = require("../controllers/studyPlanController");

const { getResources, saveResources, viewResources } = require("../controllers/resourceController");

const router = express.Router();

// Define the routes
router.post("/save-study-plan", saveStudyPlan);
router.get("/get-study-plans", getStudyPlans);
router.delete("/delete-study-plan", deleteStudyPlan);
router.post("/get-subtopics", getSubtopics);
router.post("/generate-study-plan", generateStudyPlan);
router.put("/start-study", startStudy);
router.get("/get-ongoing-plans", getOngoingPlans);
router.put("/update-progress", updateProgress);
router.put("/complete-study", completeStudy);
router.post("/get-resources", getResources);
router.post("/generate-manual-plan", generateManualPlan);
router.get("/history", getAllPlans);
router.post("/save-resources", saveResources);
router.get("/view-resources", viewResources); // Adjusted to use the correct function
router.get('/get-user-plans/:userId', getUserPlans);


module.exports = router;
