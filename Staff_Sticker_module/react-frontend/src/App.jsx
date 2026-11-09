import React, { useState, useEffect } from 'react';
import { StickerProvider } from './context/StickerContext';
import StickerRequestForm from './components/StickerRequestForm';
import RequestsList from './components/RequestsList';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('requests');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info from localStorage or auth service
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <StickerProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <h1>🎫 Sticker Management System</h1>
              <p>Request, approve, and manage stickers</p>
            </div>

            {user && (
              <div className="user-section">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            )}
          </div>
        </header>

        <nav className="app-nav">
          <button
            className={`nav-item ${currentView === 'requests' ? 'active' : ''}`}
            onClick={() => setCurrentView('requests')}
          >
            My Requests
          </button>
          <button
            className={`nav-item ${currentView === 'new' ? 'active' : ''}`}
            onClick={() => setCurrentView('new')}
          >
            New Request
          </button>
        </nav>

        <main className="app-main">
          {currentView === 'requests' && <RequestsList />}
          {currentView === 'new' && (
            <StickerRequestForm
              onSuccess={() => {
                setCurrentView('requests');
              }}
            />
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Sticker Management System. All rights reserved.</p>
        </footer>
      </div>
    </StickerProvider>
  );
}

export default App;
