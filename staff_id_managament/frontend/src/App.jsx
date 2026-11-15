import { useEffect } from 'react';
import StaffDashboard from './pages/StaffDashboard'

function App() {
  useEffect(() => {
    const mainSystemOrigin = new URL(import.meta.env.VITE_MAIN_SYSTEM_URL).origin;

    const handleMessage = (event) => {
      if (event.origin !== mainSystemOrigin) {
        return;
      }

      if (event.data?.type === 'AUTH_TOKEN') {
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
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, mainSystemOrigin);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <StaffDashboard />
}

export default App
