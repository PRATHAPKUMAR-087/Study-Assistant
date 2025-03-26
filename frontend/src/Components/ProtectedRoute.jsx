import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is logged in by verifying if the email exists in sessionStorage
  const userEmail = sessionStorage.getItem('userEmail');
  
  if (!userEmail) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the protected content
  return children;
};

export default ProtectedRoute;
