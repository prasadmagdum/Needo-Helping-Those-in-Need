import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ role, children }) => {
  const { token, user } = useAuth();

  // If not logged in, send to login
  if (!token) return <Navigate to="/login" replace />;

  // If a role is specified and doesn't match, send to dashboard
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;

  // Otherwise, render child component
  return children;
};

export default RoleRoute;
