import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useStudentProfile } from '../hooks/useStudentData';
import { FormSkeleton, LoadingBar } from '../components/LoadingStates';

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
      <LoadingBar isLoading={loading} />
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gray-50">
        
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 lg:px-6">
            <div className="flex items-center py-5">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">
                  {displayProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{displayProfile.name}</h1>
                <p className="text-[11px] text-gray-400 mt-1">{displayProfile.student_number} • {displayProfile.department}</p>
                <div className="flex items-center mt-1.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                    {displayProfile.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-7 max-w-7xl mx-auto px-5 lg:px-6 pb-20">
          {loading ? (
            <div className="card">
              <FormSkeleton fields={8} />
            </div>
          ) : (
            <>
          {/* Personal Information */}
          <div className="card mb-7">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Personal Information</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student ID</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.student_number}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <p className="mt-1.5 text-[13px] text-gray-900 capitalize">{displayProfile.status}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Since</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{new Date(displayProfile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Academic Information</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">College</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.college}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department/Program</label>
                  <p className="mt-1.5 text-[13px] text-gray-900">{displayProfile.department}</p>
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </>
  );
};

export default Profile;