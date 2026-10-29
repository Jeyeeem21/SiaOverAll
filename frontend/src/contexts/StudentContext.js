import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get student from URL params (for integration with parent system)
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('student_id');
    const studentEmail = params.get('student_email');
    const studentName = params.get('student_name');
    const studentPhone = params.get('student_phone');

    if (studentEmail) {
      const studentData = {
        student_id: studentId || '',
        student_email: studentEmail,
        student_name: studentName || '',
        student_phone: studentPhone || ''
      };
      setStudent(studentData);
      // Save to localStorage for convenience
      localStorage.setItem('authenticatedStudent', JSON.stringify(studentData));
      setLoading(false);
      return;
    }

    // Try to get from localStorage (if previously set)
    const savedStudent = localStorage.getItem('authenticatedStudent');
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (e) {
        console.error('Failed to parse saved student data');
      }
    }

    setLoading(false);

    // Listen for postMessage from parent system (for iframe integration)
    const handleMessage = (event) => {
      if (event.data.type === 'STUDENT_AUTH' && event.data.data) {
        const studentData = event.data.data;
        setStudent(studentData);
        // Save to localStorage
        localStorage.setItem('authenticatedStudent', JSON.stringify(studentData));
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that we're ready to receive student data
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'PRINT_ORDER_MODULE_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('authenticatedStudent');
  };

  return (
    <StudentContext.Provider value={{ student, setStudent, logout, loading }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
}
