import React from 'react';
import './App.css';
import CreateOrder from './components/CreateOrder';
import SkeletonLoader from './components/SkeletonLoader';
import { StudentProvider, useStudent } from './contexts/StudentContext';
import { ToastProvider } from './components/ToastProvider';

function AppContent() {
  const { student, loading } = useStudent();
  const isEmbedded = window.self !== window.top;

  // Show loading while checking for student context
  if (loading) {
    return (
      <div className="App">
        {!isEmbedded && (
          <header className="App-header">
            <div className="container">
              <div className="header-content">
                <h1>📄 Document Printing Order System</h1>
                <a href={`${import.meta.env.VITE_STUDENT_PORTAL_URL}/dashboard`} className="btn btn-secondary btn-small">
                  ← Student Portal
                </a>
              </div>
            </div>
          </header>
        )}

        <main className="container">
          <SkeletonLoader type="form" count={1} />
        </main>

        <footer className="App-footer">
          <p>© {new Date().getFullYear()} Print Order System - Powered by Laravel & React</p>
        </footer>
      </div>
    );
  }

  // Show student info if authenticated
  const studentInfo = student ? (
    <div className="student-info">
      <span className="student-name">👤 {student.student_name || student.student_email}</span>
    </div>
  ) : null;

  const handleOrderCreated = () => {
    // Optionally show success message or reset form
    // The CreateOrder component already handles success messages
  };

  return (
    <div className="App">
      {!isEmbedded && (
        <header className="App-header">
          <div className="container">
            <div className="header-content">
              <div>
                <h1>📄 Document Printing Order System</h1>
                {studentInfo}
              </div>
              <a href={`${import.meta.env.VITE_STUDENT_PORTAL_URL}/dashboard`} className="btn btn-secondary btn-small">
                ← Student Portal
              </a>
            </div>
          </div>
        </header>
      )}

      <main className="container">
        <CreateOrder onOrderCreated={handleOrderCreated} />
      </main>

      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Print Order System - Powered by Laravel & React</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <StudentProvider>
        <AppContent />
      </StudentProvider>
    </ToastProvider>
  );
}

export default App;
