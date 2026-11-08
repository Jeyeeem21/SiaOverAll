import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ role, children }) => {
  const { user } = useAuth();

  // If no user, redirect to login (handled by ProtectedRoute, but double-check)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRole = Array.isArray(role)
    ? role.includes(user.role)
    : user.role === role;

  if (!hasRole) {
    // Redirect to home or show unauthorized message
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;