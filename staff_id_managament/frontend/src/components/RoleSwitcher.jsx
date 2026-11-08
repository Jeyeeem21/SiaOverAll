import { useState, useEffect } from 'react';

export default function RoleSwitcher({ currentUser, onRoleChange }) {
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('userRole') || 'Admin';
  });

  useEffect(() => {
    localStorage.setItem('userRole', selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
    if (onRoleChange) {
      onRoleChange(role);
    }
    // Reload to fetch new user data
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-50">
      <div className="text-xs font-medium text-gray-500 mb-2">Testing Mode - Switch Role:</div>
      <div className="flex gap-2">
        <button
          onClick={() => handleRoleChange('Admin')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRole === 'Admin'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          👨‍💼 Admin
        </button>
        <button
          onClick={() => handleRoleChange('Staff')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRole === 'Staff'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          👔 Staff
        </button>
        <button
          onClick={() => handleRoleChange('Student')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRole === 'Student'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎓 Student
        </button>
      </div>
      {currentUser && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          Current: <span className="font-semibold">{currentUser.full_name}</span> ({currentUser.role})
        </div>
      )}
    </div>
  );
}
