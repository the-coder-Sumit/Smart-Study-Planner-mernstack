import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  // If user is already logged in, redirect them to dashboard
  return token ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
