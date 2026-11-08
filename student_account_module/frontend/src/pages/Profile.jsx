import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useStudentProfile } from '../hooks/useStudentData';

const Profile = () => {
  const { user, logout } = useAuth();
  const { profile, loading, error } = useStudentProfile();

  // Use real profile data if available
  const displayProfile = profile || user || {
    name: 'Student User',
    email: 'student@example.com',
    student_number: '2024-0001',
    college: 'College of Computer Studies',
    department: 'Information Technology',
    phone: '+63 912 345 6789',
    status: 'verified',
    created_at: '2024-01-15'
  };

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">
                  {displayProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{displayProfile.name}</h1>
                <p className="text-sm text-gray-600">{displayProfile.student_number} • {displayProfile.department}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {displayProfile.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.student_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{displayProfile.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(displayProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Academic Information</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">College</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.college}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department/Program</label>
                  <p className="mt-1 text-sm text-gray-900">{displayProfile.department}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;