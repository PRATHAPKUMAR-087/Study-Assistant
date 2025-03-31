import "bootstrap/dist/css/bootstrap.min.css";
import { BarChart, Bell, BookOpen, Clock, HelpCircle, Info, ListChecks, LogOut, Menu, Moon, Search, Settings, Sun, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react"; // Ensure useEffect is imported
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      const email = sessionStorage.getItem("userEmail"); // Assuming email is stored in sessionStorage
      if (!email) return;

      try {
        const response = await fetch(`http://localhost:5000/api/getUser?email=${email}`);
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username);
        } else {
          console.error("Error fetching username:", data.message);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []); // Empty dependency array ensures this runs once when component mounts

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  return (
    <div className={`d-flex ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`} style={{ minHeight: "100vh", overflowX: "hidden", width: "100vw" }}>
      {/* Sidebar */}
      <nav className={`bg-primary text-white position-fixed top-0 start-0 p-4`} style={{ width: sidebarOpen ? "250px" : "0", height: "100vh", zIndex: 1000, transition: "width 0.3s ease-in-out", overflow: "hidden", visibility: sidebarOpen ? "visible" : "hidden" }}>
        <button className="btn btn-light mb-3 w-100" onClick={() => setSidebarOpen(false)}><Menu /></button>
        <ul className="list-unstyled">
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/saved-plans")}><button className="btn btn-light mb-3 w-100"><BookOpen /> Study Plans</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2"><button className="btn btn-light mb-3 w-100"><Clock /> Reminders</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/progress-tracker")}><button className="btn btn-light mb-3 w-100"><BarChart /> Progress Tracker</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/ongoing-schedules")}><button className="btn btn-light mb-3 w-100"><ListChecks /> Ongoing Schedules</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2"><button className="btn btn-light mb-3 w-100"><HelpCircle /> Help & Support</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2"><button className="btn btn-light mb-3 w-100"><Info /> About</button></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? "250px" : "0px", transition: "margin 0.3s ease-in-out" }}>
        {/* Header */}
        <header className="d-flex justify-content-between align-items-center p-3 shadow bg-white">
          <div className="d-flex align-items-center gap-3">
            {!sidebarOpen && <button className="btn btn-primary" onClick={() => setSidebarOpen(true)}><Menu /></button>}
            <h1 className="fs-4 fw-bold m-0 ms-3 text-capitalize">Hey,{username}! Ready to Study 🎓</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Search className="cursor-pointer" />
            <Bell className="cursor-pointer" />
            <div className="position-relative">
              <button className="btn btn-outline-secondary" onClick={() => setDropdownOpen(!dropdownOpen)}><User /></button>
              {dropdownOpen && <div className="position-absolute end-0 mt-2 bg-white shadow rounded p-2" style={{ zIndex: 1050, minWidth: "180px" }}>
                <ul className="list-unstyled m-0">
                  <li className="py-2 px-3 cursor-pointer d-flex align-items-center"><button className="btn btn-light mb-3 w-100"><Settings className="me-2" /> Accounts & Settings</button></li>
                  <li className="py-2 px-3 cursor-pointer d-flex align-items-center"><button className="btn btn-light mb-3 w-100"><Users className="me-2" /> Switch Account</button></li>
                  <li className="py-2 px-3 cursor-pointer d-flex align-items-center" onClick={handleLogout}><button className="btn btn-light mb-3 w-100 text-danger"><LogOut className="me-2" /> Logout</button></li>
                </ul>
              </div>}
            </div>
            <button className="btn btn-outline-secondary" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun /> : <Moon />}</button>
          </div>
        </header>
        {/* Content Area */}
        <main className="container-fluid mt-4">
          <div className="row g-5">
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">📚 Generate New Study Plan</h2><button className="btn btn-primary mt-3" onClick={() => navigate("/generate-study-plan")}>Create New Plan</button></div></div>
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">⏰ Create Study Reminder</h2><button className="btn btn-warning mt-3">Set Reminder</button></div></div>
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">📊 Your Progress Tracker</h2><button className="btn btn-primary mt-3" onClick={() => navigate("/progress-tracker")}>See Progress</button></div></div>
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">✅ View Saved Plans</h2><button className="btn btn-primary mt-3" onClick={() => navigate("/saved-plans")}>Created Schedules</button></div></div>
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">📅 View Ongoing Schedules</h2><button className="btn btn-primary mt-3" onClick={() => navigate("/ongoing-schedules")}>Current Schedules</button></div></div>
            <div className="col-lg-6"><div className="card border-0 shadow p-4 text-center"><h2 className="fs-5 fw-semibold">📒 Create Manual plan</h2><button className="btn btn-primary mt-3" onClick={() => navigate("/manual-schedule")}>Create Manually</button></div></div>
          </div>
        </main>
      </div>
    </div>
  );
}
