import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show loading indicator or redirect
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, show children
  return children;
};

export default ProtectedRoute;