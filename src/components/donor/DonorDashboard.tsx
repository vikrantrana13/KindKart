import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { KindKartLogo } from '../KindKartLogo';
import { 
  LayoutDashboard, 
  Plus, 
  Package, 
  History, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function DonorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/donor/dashboard' },
    { icon: Plus, label: 'New Donation', path: '/donor/new-donation' },
    { icon: Package, label: 'My Donations', path: '/donor/my-donations' },
    { icon: History, label: 'Donation History', path: '/donor/history' },
    { icon: User, label: 'Profile', path: '/donor/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <KindKartLogo size={40} className="text-white" />
            <span className="text-2xl font-bold text-white">KindKart</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white text-right hidden sm:block">
              <p className="font-semibold">{user.name || 'Guest User'}</p>
              <p className="text-xs text-emerald-100">Donor</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen bg-white shadow-xl z-30 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-64 overflow-y-auto`}
          style={{ top: '72px' }}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all group mt-4"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '72px' }}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
