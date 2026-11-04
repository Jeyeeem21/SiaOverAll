import React, { useState, useEffect } from 'react';
import { StickerProvider } from './context/StickerContext';
import StickerRequestForm from './components/StickerRequestForm';
import './App.css';

function App() {
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
            </div>

            {user && (
              <div className="user-section">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            )}
          </div>
        </header>

        <main className="app-main">
          <StickerRequestForm />
        </main>

        <footer className="app-footer">
          <p>&copy; 2024 Sticker Management System. All rights reserved.</p>
        </footer>
      </div>
    </StickerProvider>
  );
}

export default App;
