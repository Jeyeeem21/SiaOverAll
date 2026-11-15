import { useEffect, useState } from 'react';
import ApiService from '../services/api';

// This intentionally lives outside the component. React Strict Mode can
// remount the callback while the exchange is still in flight; a useRef is
// reset during that remount and the second instance used to redirect to
// /login after the first instance had already signed the student in.
let ssoExchangePromise = null;

const mainSystemLoginUrl = () => {
  const configuredMainSystemUrl = import.meta.env.VITE_MAIN_SYSTEM_URL
    || 'https://minsu-businesscenter.up.railway.app';
  const returnTo = new URLSearchParams(window.location.search).get('return_to');

  try {
    const configuredOrigin = configuredMainSystemUrl
      ? new URL(configuredMainSystemUrl).origin
      : null;
    const requestedUrl = returnTo ? new URL(returnTo) : null;

    if (requestedUrl && configuredOrigin && requestedUrl.origin === configuredOrigin) {
      return `${requestedUrl.origin}/login`;
    }

    if (configuredOrigin) {
      return `${configuredOrigin}/login`;
    }
  } catch {
    // Fall through to the local login only when no Main System URL is configured.
  }

  return '/login';
};

const StudentSsoCallback = () => {
  const [message, setMessage] = useState('Signing you in to Student Account...');

  useEffect(() => {
    // Only one callback instance may handle a handoff. This also protects
    // against React Strict Mode's development remount behaviour.
    if (ssoExchangePromise) {
      return undefined;
    }

    // Clear any stale authentication state immediately
    ApiService.removeAuthToken();
    const token = new URLSearchParams(window.location.search).get('token')
      || new URLSearchParams(window.location.hash.slice(1)).get('token');

    if (!token) {
      setMessage('The sign-in link is invalid. Returning to Main System login...');
      window.setTimeout(() => window.location.replace(mainSystemLoginUrl()), 1200);
      return undefined;
    }

    // Clear the token from URL immediately for security
    window.history.replaceState(null, '', '/sso');

    ssoExchangePromise = ApiService.exchangeSsoToken(token)
      .then((session) => {
        // Convert the verified Main System token into a Student Account token
        ApiService.setAuthToken(session.token);
        window.location.replace('/dashboard');
      })
      .catch((error) => {
        // Permit an explicit retry if the exchange itself failed.
        ssoExchangePromise = null;
        ApiService.removeAuthToken();
        setMessage(error.message || 'Unable to sign in to Student Account. Returning to Main System login...');
        window.setTimeout(() => window.location.replace(mainSystemLoginUrl()), 1500);
      });

    return undefined;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default StudentSsoCallback;
