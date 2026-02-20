import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  // ✅ UPDATED: Look for the real token instead of the "true" string
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // If no token exists, redirect to login
    return <Navigate to="/admin/login" replace />;
  }

  // If token exists, allow access to the admin pages
  return children;
}