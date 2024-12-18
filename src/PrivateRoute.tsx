import { Navigate, Outlet } from "react-router-dom";
import React from "react";

const PrivateRoute = () => {
  const jwt = true;
  return jwt ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
