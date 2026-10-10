import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Redirects to /signin (remembering where you were headed) if not logged in. */
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/** Same as RequireAuth, but also requires is_staff — enforced again server-side. */
export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="empty-state">
          <i className="bi bi-shield-lock"></i>
          <p>You need an admin account to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
