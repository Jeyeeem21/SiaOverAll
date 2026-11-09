import { Outlet, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import SystemNavigation from '../components/SystemNavigation';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';


const MainLayout = () => {
  const { isAdmin, isStaff, user, logout } = useAuth();
  const { pathname } = useLocation();
  const [showUserMenuPos, setShowUserMenuPos] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userMenuRefPos = useRef(null);
  const staffPageLabel = {
    '/pos': 'Point of Sale',
    '/orders': 'Order Management',
    '/print-orders': 'Print Orders',
    '/rentals': 'Rental Management',
    '/toga-rentals': 'Toga Rental',
    '/staff-management': 'ID Management',
  }[pathname] || 'Business Center';

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRefPos.current && !userMenuRefPos.current.contains(event.target)) {
        setShowUserMenuPos(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - Only for Admins */}
      {isAdmin && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isAdmin ? 'md:pb-0' : ''} pb-16 md:pb-0`}>
        {/* Staff Navigation Header - Always visible for Staff */}
        {isStaff && (
          <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-gray-900 font-bold text-lg">MinSU Business Center</h1>
                  <p className="text-gray-500 text-xs">{staffPageLabel}</p>
                </div>
              </div>
              <SystemNavigation header />
              <div className="relative" ref={userMenuRefPos}>
                <button
                  onClick={() => setShowUserMenuPos(!showUserMenuPos)}
                  className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group border border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {(user?.name || 'Staff').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-gray-900 font-semibold text-sm">{user?.name || 'Staff User'}</p>
                    <p className="text-gray-500 text-xs">Staff</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showUserMenuPos ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenuPos && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Staff User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'staff@minsu.com'}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button 
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 transition-colors text-left text-sm text-red-600 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - Only for Admins */}
      {isAdmin && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        type="danger"
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MainLayout;
