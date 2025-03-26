import React from "react";
import "../Styles/WelcomePage.css";

const WelcomePage = () => {
  return (
    <div className="welcome-page">
      <header className="header">
        <nav>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="container">
        <h1>Welcome to Virtual Study Assistant</h1>
        <p>Your personalized study assistant</p>
        <div className="button-container">
          <a href="/register" className="button">Register if New User</a>
          <a href="/login" className="button">Login if Existing User</a>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2023 Virtual Study Assistant. All rights reserved.</p>
        <p><a href="/terms">Terms and Conditions</a></p>
      </footer>
    </div>
  );
};

export default WelcomePage;
