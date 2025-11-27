import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute - Restricts access to authenticated users only
 * If user is not logged in, redirects to /login
 * If user is logged in, allows access to the protected component
 */
export const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.worker);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

/**
 * PublicRoute - Restricts access to unauthenticated users only
 * If user is already logged in, redirects to /home (or /clienthome based on type)
 * If user is not logged in, allows access to the public component (login, signup, etc.)
 */
export const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.worker);

  // Check if user is already authenticated
  if (isAuthenticated && user) {
    // Redirect to home for both client and worker
    return <Navigate to="/home" replace />;
  }

  // User is not authenticated, render the public component
  return children;
};

/**
 * ClientOnlyRoute - Restricts access to client users only
 * If user is not a client, redirects to /home
 */
export const ClientOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.worker);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.userType !== "client") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

/**
 * WorkerOnlyRoute - Restricts access to worker users only
 * If user is not a worker, redirects to /clienthome
 */
export const WorkerOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.worker);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.userType !== "worker") {
    return <Navigate to="/clienthome" replace />;
  }

  return children;
};

export default ProtectedRoute;
