import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ToastProvider';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verification from './pages/Verification';
import Orders from './pages/Orders';
import StudentSsoCallback from './pages/StudentSsoCallback';
import IdRequest from './pages/IdRequest';

// Dev Pages (No authentication required) - STUDENT FOCUSED ONLY
import DevLogin from './pages/DevLogin';
import DevRegister from './pages/DevRegister';
import DevDashboard from './pages/DevDashboard';
import DevVerification from './pages/DevVerification';
import DevOrders from './pages/DevOrders';
import DevProfile from './pages/DevProfile';
import DevProducts from './pages/DevProducts';
import DevDocuments from './pages/DevDocuments';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Navigation from './components/Navigation';
import CartDrawer from './components/CartDrawer';

const PrintServices = () => {
  const { user } = useAuth();
  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    if (!user || !iframeRef.current) return;

    const sendStudentData = () => {
      const studentData = {
        type: 'STUDENT_AUTH',
        data: {
          student_id: user.student_number || user.reference_no || '',
          student_email: user.email || '',
          student_name: user.name || '',
          student_phone: user.phone || user.contact_number || ''
        }
      };

      // Send message to iframe
      const printFrontendUrl = import.meta.env.VITE_PRINT_FRONTEND_URL;
      iframeRef.current.contentWindow.postMessage(studentData, printFrontendUrl);
    };

    // Listen for ready message from print module
    const handleMessage = (event) => {
      const printFrontendUrl = import.meta.env.VITE_PRINT_FRONTEND_URL;
      if (event.origin !== printFrontendUrl) return;
      if (event.data.type === 'PRINT_ORDER_MODULE_READY') {
        sendStudentData();
      }
    };

    window.addEventListener('message', handleMessage);

    // Also send data after a short delay in case iframe is already loaded
    const timer = setTimeout(sendStudentData, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [user]);

  return (
    <>
      <Navigation userRole="student" />
      <main className="bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
        <iframe
          ref={iframeRef}
          title="Student Print Services"
          src={import.meta.env.VITE_PRINT_FRONTEND_URL}
          className="h-full w-full border-0"
        />
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <CartDrawer />
              <Routes>
              {/* Dev Routes - STUDENT ACCOUNT & VERIFICATION SYSTEM ONLY */}
              <Route path="/dev/login" element={<DevLogin />} />
              <Route path="/dev/register" element={<DevRegister />} />
              <Route path="/dev/dashboard" element={<Navigate replace to="/dashboard" />} />
              <Route path="/dev/verification" element={<DevVerification />} />
              <Route path="/dev/orders" element={<DevOrders />} />
              <Route path="/dev/profile" element={<DevProfile />} />
              <Route path="/dev/products" element={<DevProducts />} />
              <Route path="/dev/documents" element={<DevDocuments />} />

              {/* Keep Student Portal navigation visible while displaying the separate print module. */}
              <Route path="/print-services" element={<PrintServices />} />

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sso" element={<StudentSsoCallback />} />

              {/* Protected routes must be registered directly in this Routes
                  tree. Nesting another Routes inside a pathless Route makes
                  /dashboard fall through to the catch-all /login redirect. */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <DevDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <DevProfile />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verification"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <Verification />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <Orders />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <DevProducts />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <Navigate replace to="/profile" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/id-request"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute role="student">
                      <IdRequest />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={<Navigate replace to="/dashboard" />}
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate replace to="/dashboard" />
                  </ProtectedRoute>
                }
              />

              {/* Unknown/stale routes must never open the developer login. */}
              <Route
                path="*"
                element={
                  <Navigate replace to="/login" />
                }
              />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </CartProvider>
  </AuthProvider>
  );
}

export default App;
