import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { KindKartLogo } from '../KindKartLogo';
import {
  LayoutDashboard,
  Package,
  Truck,
  CheckCircle,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  BadgeCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeaders } from '../../lib/api';

type NgoStatus = 'pending' | 'approved' | 'rejected' | null;

export function NGODashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await fetch(API_BASE + '/profile/me', {
          headers: getAuthHeaders(),
        });

        if (res.ok === false) {
          return;
        }

        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('Profile refresh failed:', error);
      }
    };

    refreshUser();
  }, []);

  const ngoStatus = (user.ngoVerificationStatus || null) as NgoStatus;
  const isApprovedNgo = ngoStatus === 'approved';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/ngo/dashboard', restricted: false },
    { icon: Package, label: 'Available Donations', path: '/ngo/available-donations', restricted: true },
    { icon: Truck, label: 'My Pickups', path: '/ngo/my-pickups', restricted: true },
    { icon: CheckCircle, label: 'Completed', path: '/ngo/completed', restricted: true },
    { icon: User, label: 'Profile', path: '/ngo/profile', restricted: false },
  ];

  const isActive = (path: string) => location.pathname === path;
  const statusLabel = ngoStatus || 'pending';

  let statusClasses = 'bg-amber-100 text-amber-700';
  if (statusLabel === 'approved') {
    statusClasses = 'bg-emerald-100 text-emerald-700';
  } else if (statusLabel === 'rejected') {
    statusClasses = 'bg-red-100 text-red-700';
  }

  const toggleSidebar = () => setSidebarOpen((prev) => prev === false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <KindKartLogo size={40} className="text-white" />
            <span className="text-2xl font-bold text-white">KindKart</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="text-white text-right hidden sm:block">
              <p className="font-semibold">{user.name || 'NGO User'}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <BadgeCheck className="w-4 h-4" />
                <span className={'px-2 py-0.5 rounded-full text-[11px] font-semibold ' + statusClasses}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={
            'fixed lg:sticky top-0 left-0 h-screen bg-white shadow-xl z-30 transition-transform duration-300 ' +
            (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') +
            ' w-64 overflow-y-auto'
          }
          style={{ top: '72px' }}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const disabled = item.restricted && isApprovedNgo === false;

              if (disabled) {
                return (
                  <button
                    key={item.path}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-left">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ' +
                    (isActive(item.path)
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600')
                  }
                >
                  <Icon
                    className={
                      'w-5 h-5 transition-transform ' +
                      (isActive(item.path) ? 'scale-110' : 'group-hover:scale-110')
                    }
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all group mt-4"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {sidebarOpen ? (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '72px' }}
          ></div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
