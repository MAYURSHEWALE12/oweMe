import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiGrid, FiDollarSign, FiFileText, FiSettings,
  FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiBell,
} from 'react-icons/fi';
import { getUnreadCount, getNotifications, markAllRead } from '../services/notificationService';
import NotificationPanel from '../components/NotificationPanel';
import { LogoIcon } from '../components/Logo';

function getToken() { return localStorage.getItem('accessToken'); }
const API = import.meta.env.VITE_API_URL || '/api';

const navItems = [
  { path: '/reports', label: 'Reports', icon: FiFileText },
  { path: '/transactions', label: 'Transactions', icon: FiDollarSign },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();

  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(`${window.innerHeight}px`);
    };
    handleResize(); // Initial set
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotifs = useCallback(async () => {
    try { const { count } = await getUnreadCount(); setNotifCount(count); } catch {}
  }, []);

  const openNotifs = async () => {
    setNotifOpen(true);
    try {
      const data = await getNotifications();
      setNotifs(data.slice(0, 20));
      await markAllRead();
      setNotifCount(0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    let es = null;
    try {
      es = new EventSource(`${API}/sse/notifications?token=${getToken()}`);
      es.addEventListener('notification', (e) => {
        try { const data = JSON.parse(e.data); setNotifCount(prev => prev + 1); } catch {}
      });
      es.addEventListener('connected', () => {});
    } catch {}
    return () => { if (es) es.close(); };
  }, [fetchNotifs]);
  useEffect(() => { const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavContent = () => (
    <>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <LogoIcon size={32} />
          <span className="font-bold text-lg text-gray-900 dark:text-white">OweMe</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={notifRef}>
            <button onClick={openNotifs} className="relative p-1.5 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
              <FiBell size={18} />
              {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifs}
              unreadCount={notifCount}
              onMarkAllRead={async () => { try { await markAllRead(); setNotifCount(0); } catch {} }}
              onViewAll={() => { setNotifOpen(false); navigate('/notifications'); }}
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
            <FiX size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-white/5">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.shopName}</p>
            </div>
            <FiChevronDown size={16} className="text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-white/5 py-1">
              <button
                onClick={toggleDark}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 overflow-hidden" style={{ height: viewportHeight }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/5
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <NavContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
            <FiMenu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <LogoIcon size={28} />
            <span className="font-bold text-gray-900 dark:text-white">OweMe</span>
          </div>
          <button onClick={toggleDark} className="text-gray-600 dark:text-gray-300">
            {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}