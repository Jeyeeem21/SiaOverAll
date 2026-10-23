import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import OrdersPreview from './OrdersPreview';
import ApiService from '../services/api';

const Navigation = ({ userRole = 'student' }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY]               = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen]         = useState(false);
  const [isOrdersPreviewVisible, setIsOrdersPreviewVisible] = useState(false);
  const [orderHoverTimeout, setOrderHoverTimeout]   = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm]   = useState(false);

  // Notification state
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications]   = useState([]);
  const [notifLoading, setNotifLoading]     = useState(false);
  const notifRef   = useRef(null);
  const notifHoverTimeout = useRef(null);
  const userMenuRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const devMode = location.pathname.includes('/dev/');
  const p = (main, dev) => devMode ? dev : main;

  // ── Nav items ───────────────────────────────────────────
  const mainNavItems = [
    {
      to: p('/dashboard', '/dev/dashboard'),
      label: 'Dashboard',
      icon: (a) => (
        <svg className={`w-6 h-6 ${a ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: p('/products', '/dev/products'),
      label: 'Products',
      icon: (a) => (
        <svg className={`w-6 h-6 ${a ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      to: p('/orders', '/dev/orders'),
      label: 'Orders',
      isOrders: true,
      icon: (a) => (
        <svg className={`w-6 h-6 ${a ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      to: p('/documents', '/dev/documents'),
      label: 'Documents',
      icon: (a) => (
        <svg className={`w-6 h-6 ${a ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const moreNavItems = [
    {
      to: p('/profile', '/dev/profile'),
      label: 'Profile',
      icon: (a) => (
        <svg className={`w-5 h-5 ${a ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const isActive = (to) => location.pathname === to;
  const isMoreActive = () => moreNavItems.some(i => isActive(i.to));

  // ── Notifications ────────────────────────────────────────
  const fetchNotifications = async () => {
    if (!ApiService.isAuthenticated()) return;
    try {
      setNotifLoading(true);
      const data = await ApiService.getNotifications();
      const list = Array.isArray(data) ? data : data?.notifications || data?.data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
    finally { setNotifLoading(false); }
  };

  const handleBellClick = () => {
    setShowNotifPanel(p => {
      if (!p) fetchNotifications();
      return !p;
    });
    setShowUserMenu(false);
    setIsMoreMenuOpen(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n => ApiService.markNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotifMouseEnter = () => {
    if (notifHoverTimeout.current) clearTimeout(notifHoverTimeout.current);
    fetchNotifications();
    setShowNotifPanel(true);
  };

  const handleNotifMouseLeave = () => {
    notifHoverTimeout.current = setTimeout(() => setShowNotifPanel(false), 180);
  };

  const getUserInitials = () => {
    const name = user?.name || '';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  // ── Click outside ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifPanel(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  useEffect(() => () => {
    if (notifHoverTimeout.current) clearTimeout(notifHoverTimeout.current);
  }, []);

  // ── Scroll hide bottom nav ───────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsBottomNavVisible(!(y > lastScrollY && y > 100));
      setLastScrollY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  // ── Orders hover ─────────────────────────────────────────
  const handleOrdersEnter = () => {
    if (orderHoverTimeout) clearTimeout(orderHoverTimeout);
    setOrderHoverTimeout(setTimeout(() => setIsOrdersPreviewVisible(true), 300));
  };
  const handleOrdersLeave = () => {
    if (orderHoverTimeout) clearTimeout(orderHoverTimeout);
    setOrderHoverTimeout(setTimeout(() => setIsOrdersPreviewVisible(false), 200));
  };

  // ── Escape + body lock ────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setShowNotifPanel(false);
      setShowUserMenu(false);
      setShowLogoutConfirm(false);
      setIsMoreMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showLogoutConfirm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showLogoutConfirm]);

  // Fetch on mount
  useEffect(() => {
    if (
      !location.pathname.includes('/login') &&
      !location.pathname.includes('/register') &&
      ApiService.isAuthenticated()
    ) {
      fetchNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Notification type config ─────────────────────────────
  const typeIcon = {
    verification_update: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    document_approved:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    document_rejected:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    order_update:        'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    payment_reminder:    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1',
    system_announcement: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  };
  const typeColor = {
    verification_update: 'bg-blue-100 text-blue-600',
    document_approved:   'bg-green-100 text-green-600',
    document_rejected:   'bg-red-100 text-red-600',
    order_update:        'bg-purple-100 text-purple-600',
    payment_reminder:    'bg-yellow-100 text-yellow-600',
    system_announcement: 'bg-gray-100 text-gray-500',
  };
  const defaultIcon  = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  const defaultColor = 'bg-gray-100 text-gray-500';

  // ── Notification list UI (shared desktop & mobile) ───────
  const NotifList = () => (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
        )}
      </div>
      <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {notifLoading ? (
          <li className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </li>
        ) : notifications.length === 0 ? (
          <li className="flex flex-col items-center py-10 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">You're all caught up!</p>
          </li>
        ) : notifications.map(notif => (
          <li key={notif.id} className={`flex gap-3 px-4 py-3 transition ${!notif.is_read ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${typeColor[notif.type] || defaultColor}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcon[notif.type] || defaultIcon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                {notif.is_important && <span className="text-red-500 mr-1">●</span>}
                {notif.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
              <p className="text-[10px] text-gray-400 mt-1">{notif.time_ago}</p>
            </div>
            {!notif.is_read && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <button onClick={() => handleMarkRead(notif.id)} className="text-[10px] text-blue-500 hover:text-blue-700">Read</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );

  if (location.pathname.includes('/login') || location.pathname.includes('/register')) return null;

  return (
    <>
      {/* ══════════════════ DESKTOP HEADER ══════════════════ */}
      <header className="hidden md:flex bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 items-center h-16 px-6 lg:px-10 gap-6">

        {/* Logo */}
        <Link to={p('/dashboard', '/dev/dashboard')} className="flex items-center gap-2.5 shrink-0 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900">Student Portal</span>
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-1 flex-1">
          {[...mainNavItems, ...moreNavItems].map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`orders-preview-container relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onMouseEnter={item.isOrders ? handleOrdersEnter : undefined}
                onMouseLeave={item.isOrders ? handleOrdersLeave : undefined}
              >
                {item.icon(active)}
                <span>{item.label}</span>
                {item.isOrders && (
                  <OrdersPreview
                    isVisible={isOrdersPreviewVisible}
                    onMouseEnter={() => { if (orderHoverTimeout) clearTimeout(orderHoverTimeout); }}
                    onMouseLeave={handleOrdersLeave}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right — Bell + Avatar */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell */}
          <div
            className="relative"
            ref={notifRef}
            onMouseEnter={handleNotifMouseEnter}
            onMouseLeave={handleNotifMouseLeave}
          >
            <button
              onClick={handleBellClick}
              className={`relative p-2 rounded-lg transition ${showNotifPanel ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
            {showNotifPanel && (
              <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[70]">
                <NotifList />
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Avatar dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(p => !p); setShowNotifPanel(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getUserInitials()}
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden lg:block">
                {user?.name?.split(' ')[0] || 'Student'}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[70]">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════ MOBILE TOP BAR ══════════════════ */}
      {/* Shown only on mobile — has logo + bell */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 h-14">
        <Link to={p('/dashboard', '/dev/dashboard')} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Student Portal</span>
        </Link>

        {/* Bell button */}
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* ══════════════════ MOBILE BOTTOM NAV ══════════════════ */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ${
          isBottomNavVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16 relative">

          {/* 4 main items */}
          {mainNavItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMoreMenuOpen(false)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                onMouseEnter={item.isOrders ? handleOrdersEnter : undefined}
                onMouseLeave={item.isOrders ? handleOrdersLeave : undefined}
                onTouchStart={item.isOrders ? () => setIsOrdersPreviewVisible(p => !p) : undefined}
              >
                {active && <span className="absolute top-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />}
                <div className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                  {item.icon(active)}
                </div>
                <span className="text-[9px] font-semibold">{item.label}</span>
                {item.isOrders && (
                  <OrdersPreview isVisible={isOrdersPreviewVisible} onMouseEnter={() => { if (orderHoverTimeout) clearTimeout(orderHoverTimeout); }} onMouseLeave={handleOrdersLeave} />
                )}
              </Link>
            );
          })}

          {/* More button (5th slot) */}
          <button
            onClick={() => { setIsMoreMenuOpen(p => !p); setShowNotifPanel(false); }}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
              isMoreActive() || isMoreMenuOpen ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {(isMoreActive() || isMoreMenuOpen) && (
              <span className="absolute top-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
            )}
            <svg className={`w-6 h-6 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span className="text-[9px] font-semibold">More</span>
          </button>
        </div>

        {/* More menu dropdown */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
            <div className="py-2">
              {/* Profile */}
              {moreNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className={`flex items-center px-4 py-3 transition ${isActive(item.to) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="mr-3">{item.icon(isActive(item.to))}</div>
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.to) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />}
                </Link>
              ))}

              <div className="border-t border-gray-100 mt-1" />

              {/* Logout */}
              <button
                onClick={() => { setIsMoreMenuOpen(false); setShowLogoutConfirm(true); }}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-inherit" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>

      {/* Overlay for more menu */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 bg-black/20 md:hidden z-40" onClick={() => setIsMoreMenuOpen(false)} />
      )}

      <div className="h-16 md:h-0" />

      {/* ══════════════════ MOBILE NOTIF BOTTOM SHEET ═══════════ */}
      {showNotifPanel && (
        <div className="md:hidden fixed inset-0 z-[75]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNotifPanel(false)}
          />

          {/* Sheet — slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifPanel(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-base font-medium text-gray-500">You're all caught up!</p>
                  <p className="text-sm text-gray-400 mt-1">No new notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map(notif => (
                    <li
                      key={notif.id}
                      className={`flex gap-4 px-5 py-4 transition active:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5 ${typeColor[notif.type] || defaultColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcon[notif.type] || defaultIcon} />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.is_important && <span className="text-red-500 mr-1">●</span>}
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">{notif.time_ago}</p>
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              className="text-xs text-blue-600 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ LOGOUT MODAL ══════════════════════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Log out?</h3>
              <p className="text-sm text-gray-500 mt-1">You'll need to sign in again to access your account.</p>
            </div>
            <div className="px-6 py-4 space-y-2">
              <button
                onClick={() => { setShowLogoutConfirm(false); logout(); navigate('/login'); }}
                className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
              >
                Log out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
