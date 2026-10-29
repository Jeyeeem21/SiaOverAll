import React from 'react';
import './App.css';
import CreateOrder from './components/CreateOrder';
import SkeletonLoader from './components/SkeletonLoader';
import { StudentProvider, useStudent } from './contexts/StudentContext';

function AppContent() {
  const { student, loading } = useStudent();

  // Show loading while checking for student context
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="container">
            <div className="header-content">
              <h1>📄 Document Printing Order System</h1>
            </div>
          </div>
        </header>

        <main className="container">
          <SkeletonLoader type="form" count={1} />
        </main>

        <footer className="App-footer">
          <p>© 2026 Print Order System - Powered by Laravel & React</p>
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
      <header className="App-header">
        <div className="container">
          <div className="header-content">
            <h1>📄 Document Printing Order System</h1>
            {studentInfo}
          </div>
        </div>
      </header>

      <main className="container">
        <CreateOrder onOrderCreated={handleOrderCreated} />
      </main>

      <footer className="App-footer">
        <p>© 2026 Print Order System - Powered by Laravel & React</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <StudentProvider>
      <AppContent />
    </StudentProvider>
  );
}

export default App;
