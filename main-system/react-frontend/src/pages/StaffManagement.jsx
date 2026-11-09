import { useEffect, useRef, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const STAFF_ID_URL = import.meta.env.VITE_STAFF_ID_URL;

export default function StaffManagement() {
  usePageTitle('ID Management');
  const iframeRef = useRef(null);
  const [activeTab, setActiveTab] = useState('student-records');

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event) => {
      // Only accept messages from the staff ID system
      if (event.origin !== STAFF_ID_URL) return;
      
      // Handle tab changes from iframe
      if (event.data.type === 'TAB_CHANGE') {
        setActiveTab(event.data.tab);
      }
      
      // Handle token request from iframe
      if (event.data.type === 'REQUEST_AUTH_TOKEN') {
        console.log('Iframe requested auth token, sending...')
        const token = localStorage.getItem('auth_token');
        if (token && iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            { type: 'AUTH_TOKEN', token },
            STAFF_ID_URL
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Forward auth token to iframe on load
  useEffect(() => {
    const sendToken = () => {
      const token = localStorage.getItem('auth_token');
      if (token && iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'AUTH_TOKEN', token },
          STAFF_ID_URL
        );
      }
    };

    // Send token immediately and after iframe loads
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.addEventListener('load', sendToken);
      sendToken(); // Try immediately too
      
      return () => iframe.removeEventListener('load', sendToken);
    }
  }, []);

  // Handle tab clicks from parent
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Send message to iframe to change tab
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'CHANGE_TAB', tab },
      STAFF_ID_URL
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header with Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-5 lg:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">ID Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student records, ID production, status tracking, and release history
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="px-5 lg:px-6">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => handleTabClick('student-records')}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'student-records'
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Student Records
              </span>
            </button>
            <button
              onClick={() => handleTabClick('id-management')}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'id-management'
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                ID Production
              </span>
            </button>
            <button
              onClick={() => handleTabClick('id-status')}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'id-status'
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                ID Status
              </span>
            </button>
            <button
              onClick={() => handleTabClick('release-history')}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'release-history'
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Release History
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 bg-gray-50">
        <iframe
          ref={iframeRef}
          src={STAFF_ID_URL}
          className="w-full h-full border-0"
          title="ID Management System"
        />
      </div>
    </div>
  );
}
