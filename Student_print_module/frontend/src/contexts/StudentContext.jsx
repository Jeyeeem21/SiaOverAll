import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('StudentContext: Initializing...');

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
      console.log('StudentContext: Loaded from URL params:', studentData);
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
        const parsedStudent = JSON.parse(savedStudent);
        console.log('StudentContext: Loaded from localStorage:', parsedStudent);
        setStudent(parsedStudent);
      } catch (e) {
        console.error('Failed to parse saved student data:', e);
      }
    }

    setLoading(false);

    // Listen for postMessage from parent system (for iframe integration)
    const handleMessage = (event) => {
      // In development, accept messages from localhost with different ports
      const isLocalhost = event.origin.startsWith('http://localhost:') || 
                         event.origin.startsWith('http://127.0.0.1:');
      
      if (!isLocalhost) {
        console.warn('StudentContext: Rejected message from unknown origin:', event.origin);
        return;
      }

      if (event.data.type === 'STUDENT_AUTH' && event.data.data) {
        const studentData = event.data.data;
        console.log('StudentContext: Received student data via postMessage:', studentData);
        setStudent(studentData);
        // Save to localStorage
        localStorage.setItem('authenticatedStudent', JSON.stringify(studentData));
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that we're ready to receive student data
    if (window.parent !== window) {
      console.log('StudentContext: Notifying parent that module is ready');
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
