import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./Components/Dashboard.jsx";
import GenerateStudyPlan from "./Components/GenerateStudyPlan";
import HistoryPage from "./Components/HistoryPage.jsx";
import LoginPage from "./Components/LoginPage.jsx";
import ManualPlan from "./Components/ManualPlan.jsx";
import OngoingSchedules from "./Components/OngoingSchedules.jsx";
import ProgressTracker from "./Components/ProgressTracker.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx"; // Import the ProtectedRoute component
import RegisterPage from "./Components/RegisterPage.jsx";
import SavedPlans from "./Components/SavedPlans.jsx";
import SetReminder from "./Components/SetReminder.jsx";
import StudyResources from "./Components/StudyResources.jsx";
import ViewReminder from "./Components/ViewReminder.jsx";
import WelcomePage from "./Components/WelcomePage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate-study-plan" 
          element={
            <ProtectedRoute>
              <GenerateStudyPlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saved-plans" 
          element={
            <ProtectedRoute>
              <SavedPlans />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ongoing-schedules" 
          element={
            <ProtectedRoute>
              <OngoingSchedules />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/progress-tracker"
          element={
            <ProtectedRoute>
              <ProgressTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manual-schedule"
          element={
            <ProtectedRoute>
              <ManualPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history-page"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-resources"
          element={
            <ProtectedRoute>
              <StudyResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/set-reminder"
          element={
            <ProtectedRoute>
              <SetReminder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-reminder"
          element={
            <ProtectedRoute>
              <ViewReminder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
