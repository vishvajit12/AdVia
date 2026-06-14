// =====================================================================
// AdVia Frontend — ProtectedRoute
// Wraps dashboard routes: redirects to /login if not authenticated,
// or to the user's own dashboard if their role doesn't match the
// route's required role (prevents a driver from viewing /advertiser/*
// and vice-versa).
// =====================================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner label="Loading AdVia..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
