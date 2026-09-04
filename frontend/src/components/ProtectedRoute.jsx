import React from "react";
import { Navigate } from "react-router-dom";
import { getRole, getStoredUser } from "../utils/session";

const ProtectedRoute = ({ children, role, roles = [] }) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const user = getStoredUser();
  const userRole = getRole(user);
  const allowedRoles = [...roles, role].filter(Boolean).map((item) => String(item).toUpperCase());

  if (!token) {
    return <Navigate to="/customer/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
