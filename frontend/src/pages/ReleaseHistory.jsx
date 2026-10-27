import { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import RoleSwitcher from '../components/RoleSwitcher';

export default function ReleaseHistory() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest('/user').then((user) => { if (active) setCurrentUser(user) }).catch(() => { if (active) setCurrentUser(null) });
    return () => { active = false };
  }, []);

  useEffect(() => {
    loadReleases();
  }, []);

  async function loadReleases() {
    try {
      setLoading(true);
      const response = await apiRequest('/student-id-cards');
      const releasedCards = (response.data || []).filter(card => card.status === 'released');
      setReleases(releasedCards);
    } catch (err) {
      console.error('Error loading releases:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredReleases = releases.filter(release => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return release.card_number?.toLowerCase().includes(term) ||
           release.student?.full_name?.toLowerCase().includes(term) ||
           release.student?.student_id_number?.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <span className="text-xl font-semibold text-gray-800">Student Portal</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{currentUser?.full_name || 'User'}</div>
                <div className="text-xs text-gray-500">{currentUser?.role || 'Role'}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm">
                {currentUser?.full_name?.[0] || 'U'}
              </div>
            </div>
          </div>
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button onClick={() => window.location.href = '/'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Students
            </button>
            <button onClick={() => window.location.href = '/id-cards'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Cards
            </button>
            <button onClick={() => window.location.href = '/id-requests'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              ID Requests
            </button>
            <button className="px-4 lg:px-6 py-3 text-sm font-medium text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50 whitespace-nowrap">
              Release History
            </button>
            <button onClick={() => window.location.href = '/documents'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Documents
            </button>
            <button onClick={() => window.location.href = '/staff'} className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
              Staff
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 lg:px-8 py-6 lg:py-8 border-b border-gray-100">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">ID Release History</h1>
            <p className="text-sm text-gray-500 mt-2">Complete record of all released ID cards</p>
          </div>

          {/* Search */}
          <div className="px-6 lg:px-8 py-6 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by card number, student name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Number</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Released Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-sm text-gray-500">Loading...</p>
                    </td>
                  </tr>
                ) : filteredReleases.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="mt-4 text-sm text-gray-500">No released ID cards found</p>
                    </td>
                  </tr>
                ) : (
                  filteredReleases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{release.card_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {release.student?.photo_url && (
                            <img src={release.student.photo_url} alt="" className="w-10 h-10 rounded-full mr-3 object-cover" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{release.student?.full_name}</div>
                            <div className="text-sm text-gray-500">{release.student?.student_id_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{release.student?.program}</div>
                        <div className="text-sm text-gray-500">Year {release.student?.year_level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(release.released_at).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(release.released_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {release.expiry_date ? new Date(release.expiry_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Staff #{release.released_by || 'N/A'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {!loading && filteredReleases.length > 0 && (
            <div className="px-6 lg:px-8 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredReleases.length}</span> released ID card{filteredReleases.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </main>

      <RoleSwitcher currentUser={currentUser} />
    </div>
  );
}
