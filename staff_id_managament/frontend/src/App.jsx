import { useEffect } from 'react';
import StaffDashboard from './pages/StaffDashboard'

function App() {
  // Listen for auth token from parent window (iframe integration)
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin if in production
      // const allowedOrigin = import.meta.env.VITE_MAIN_SYSTEM_URL;
      // if (event.origin !== allowedOrigin) return;
      
      // Receive auth token from parent
      if (event.data.type === 'AUTH_TOKEN') {
        const { token } = event.data;
        if (token) {
          localStorage.setItem('auth_token', token);
          console.log('Auth token received from parent window');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request auth token from parent on mount
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <StaffDashboard />
}

export default App
