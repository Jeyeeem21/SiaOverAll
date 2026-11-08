import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BottomNavigation = ({ userRole = 'student' }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Navigation items based on user role - STUDENT ONLY
  const getNavigationItems = () => {
    // Only student navigation - no staff features
    return [
      {
        path: '/dev/dashboard',
        icon: (active) => (
          <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
          </svg>
        ),
        label: 'Home'
      },
      {
        path: '/dev/profile',
        icon: (active) => (
          <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        label: 'Profile'
      },
      {
        path: '/dev/verification',
        icon: (active) => (
          <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Verification',
        badge: 1
      },
      {
        path: '/dev/orders',
        icon: (active) => (
          <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        label: 'Orders'
      }
    ];
  };

  const navigationItems = getNavigationItems();

  // Check if current path matches
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Don't show on login/register pages
  if (location.pathname.includes('/login') || location.pathname.includes('/register')) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile/tablet */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="grid grid-cols-4 md:grid-cols-5 h-16">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center px-1 py-2 text-xs transition-colors duration-200 relative ${
                  active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                }`}
              >
                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-1 right-1/2 transform translate-x-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
                
                {/* Icon */}
                <div className="mb-1">
                  {item.icon(active)}
                </div>
                
                {/* Label */}
                <span className={`font-medium truncate w-full text-center ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-t"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for content when bottom nav is present - Only on mobile */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default BottomNavigation;