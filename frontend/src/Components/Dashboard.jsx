import "bootstrap/dist/css/bootstrap.min.css";
import { BarChart, BookOpen, Clock, Home, ListChecks, LogOut, Menu, Settings, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Dashboard.css";

const cardData = [
  { title: "Generate New Study Plan", btnText: "Create New Plan", link: "/generate-study-plan", icon: "bi-book", color: "text-primary" },
  { title: "Create Manual Plan", btnText: "Create Manually", link: "/manual-schedule", icon: "bi-pencil-square", color: "text-danger" },
  { title: "Create Study Reminder", btnText: "Set Reminder", link: "#", icon: "bi-alarm", color: "text-warning" },
  { title: "Your Progress Tracker", btnText: "See Progress", link: "/progress-tracker", icon: "bi-graph-up", color: "text-success" },
  { title: "View Saved Plans", btnText: "Created Schedules", link: "/saved-plans", icon: "bi-clipboard-check", color: "text-info" },
  { title: "View Ongoing Schedules", btnText: "Current Schedules", link: "/ongoing-schedules", icon: "bi-calendar-check", color: "text-dark" },
];

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
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  return (
    <div className={`d-flex`} style={{ minHeight: "100vh", overflowX: "hidden", width: "100vw" }}>
      {/* Sidebar */}
      <nav className={`bg-primary text-white position-fixed top-0 start-0 p-4`} style={{ width: sidebarOpen ? "250px" : "0", height: "100vh", zIndex: 1000, transition: "width 0.3s ease-in-out", overflow: "hidden", visibility: sidebarOpen ? "visible" : "hidden" }}>
        <button className="btn btn-light mb-3 w-30" onClick={() => setSidebarOpen(false)}><Menu /></button>
        <ul className="list-unstyled">
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onclick={() => navigate("/dashboard")}><button className="btn btn-light mb-3 w-100"><Home /> Home</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/saved-plans")}><button className="btn btn-light mb-3 w-100"><BookOpen /> Study Plans</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" ><button className="btn btn-light mb-3 w-100"><Clock /> Reminders</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/progress-tracker")}><button className="btn btn-light mb-3 w-100"><BarChart /> Progress Tracker</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/ongoing-schedules")}><button className="btn btn-light mb-3 w-100"><ListChecks /> Ongoing Schedules</button></li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/contact-us")}>
            <button className="btn btn-light mb-3 w-100"><User /> Contact Us</button>
          </li>
          <li className="py-3 border-bottom cursor-pointer d-flex align-items-center gap-2" onClick={() => navigate("/settings")}>
            <button className="btn btn-light mb-3 w-100"><Settings /> Settings</button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? "250px" : "0px", transition: "margin 0.3s ease-in-out" }}>
        {/* Header */}
        <header className="d-flex justify-content-between align-items-center p-3 shadow bg-blue">
          <div className="d-flex align-items-center gap-3 ">
            {!sidebarOpen && <button className="btn btn-primary" onClick={() => setSidebarOpen(true)}><Menu /></button>}
            <h1 className="fs-1 fw-bold m-0 ms-3 text-capitalize text-wrap" style={{ fontFamily: 'Merriweather, serif', fontWeight: '400', fontSize: '32px', color:'darkblue'}}>Welcome Back, {username}! Let's Study 🎓</h1>
          </div>
          <div className="d-flex align-items-center gap-3 position-relative">
            <button className="btn btn-outline-secondary" onClick={() => setDropdownOpen(!dropdownOpen)}><User className="text-primary" /></button>
            {/* <button className="btn btn-outline-secondary" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun className="text-warning" /> : <Moon className="text-dark" />}</button> */}
            {dropdownOpen && (
  <div className="position-absolute mt-2 bg-white shadow rounded p-2" 
  style={{ zIndex: 1050, minWidth: "200px", top: "100%", right: "0", whiteSpace: "nowrap" }}>

    <ul className="list-unstyled m-0">
      <li className="py-2 px-3 cursor-pointer d-flex align-items-center">
        <button className="btn btn-light w-100">Profile</button>
      </li>
      <li className="py-2 px-3 cursor-pointer d-flex align-items-center">
        <button className="btn btn-light w-100">Settings</button>
      </li>
      <li className="py-2 px-3 cursor-pointer d-flex align-items-center" onClick={handleLogout}>
        <button className="btn btn-light w-100 text-danger">
          <LogOut className="me-2" /> Logout
        </button>
      </li>
    </ul>
  </div>
)}


          </div>
        </header>

        {/* Content Area */}
        <main className="container-fluid mt-4">
          <div className="row g-4 justify-content-center align-items-stretch h-100">
            {cardData.map((card, index) => (
              <div key={index} className="col-lg-4 col-md-6 col-sm-12 d-flex">
                <div className="card border-0 shadow p-4 text-center rounded-4 d-flex flex-column w-100" style={{ minHeight: "250px" }}>
                  <h2 className="fs-2 flex-grow-1" style={{ fontFamily: 'Merriweather, serif', fontWeight: '500', fontSize: '32px' }}>{card.title}</h2>
                  <i className={`bi ${card.icon} mb-3 ${card.color}`} style={{ fontSize: "4rem" }}></i> {/* Bootstrap icon */}
                  <button className="btn btn-primary mt-auto" onClick={() => navigate(card.link)}>
                    {card.btnText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
