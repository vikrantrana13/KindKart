import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE, getAuthHeaders } from '../../lib/api';

interface DashboardStats {
  available: number;
  assigned: number;
  completed: number;
  totalItems: number;
}

interface ActivityItem {
  text: string;
  time: string;
}

export function NGOHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState<DashboardStats>({
    available: 0,
    assigned: 0,
    completed: 0,
    totalItems: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const ngoStatus = user.ngoVerificationStatus || 'pending';
  const isApprovedNgo = ngoStatus === 'approved';

  useEffect(() => {
    if (isApprovedNgo === false) {
      return;
    }

    const loadDashboard = async () => {
      try {
        const [availableRes, pickupsRes, completedRes] = await Promise.all([
          fetch(API_BASE + '/donations/available', { headers: getAuthHeaders() }),
          fetch(API_BASE + '/donations/my-pickups', { headers: getAuthHeaders() }),
          fetch(API_BASE + '/donations/completed-pickups', { headers: getAuthHeaders() }),
        ]);

        const [available, pickups, completed] = await Promise.all([
          availableRes.json(),
          pickupsRes.json(),
          completedRes.json(),
        ]);

        if (availableRes.ok === false || pickupsRes.ok === false || completedRes.ok === false) {
          console.error('Failed to load NGO dashboard', { available, pickups, completed });
          return;
        }

        const totalItems =
          pickups.reduce((acc: number, pickup: any) => acc + pickup.items.length, 0) +
          completed.reduce((acc: number, pickup: any) => acc + pickup.items.length, 0);

        setStats({
          available: available.length,
          assigned: pickups.length,
          completed: completed.length,
          totalItems,
        });

        setRecentActivity([
          ...pickups.slice(0, 2).map((pickup: any) => ({
            text: (pickup.status === 'picked-up' ? 'Pickup collected from ' : 'Pickup assigned from ') + pickup.donor.name,
            time: new Date(pickup.assignedDate).toLocaleDateString(),
          })),
          ...completed.slice(0, 2).map((pickup: any) => ({
            text: 'Completed donation from ' + pickup.donor,
            time: new Date(pickup.completionDate).toLocaleDateString(),
          })),
        ]);
      } catch (error) {
        console.error('NGO dashboard error:', error);
      }
    };

    loadDashboard();
  }, [isApprovedNgo]);

  const cards = [
    {
      label: 'Available Donations',
      value: stats.available,
      icon: Package,
      color: 'orange',
      path: '/ngo/available-donations',
    },
    {
      label: 'Assigned Pickups',
      value: stats.assigned,
      icon: Truck,
      color: 'blue',
      path: '/ngo/my-pickups',
    },
    {
      label: 'Completed Pickups',
      value: stats.completed,
      icon: CheckCircle,
      color: 'emerald',
      path: '/ngo/completed',
    },
    {
      label: 'Item Lines Handled',
      value: stats.totalItems,
      icon: TrendingUp,
      color: 'purple',
      path: '/ngo/completed',
    },
  ];

  const colorClasses: Record<string, { bubble: string; icon: string; text: string }> = {
    orange: { bubble: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-500' },
    blue: { bubble: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-500' },
    emerald: { bubble: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-500' },
    purple: { bubble: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-500' },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-8"
      >
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {user.name || 'Helping Hands NGO'}
          </h1>
          <p className="text-teal-50 text-lg">Here is your live pickup overview.</p>
        </div>
      </motion.div>

      {isApprovedNgo ? null : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            'rounded-2xl shadow-lg p-6 border ' +
            (ngoStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')
          }
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className={
                'w-6 h-6 mt-0.5 ' +
                (ngoStatus === 'rejected' ? 'text-red-600' : 'text-amber-600')
              }
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">NGO verification required</h2>
              <p className="text-gray-700">
                {ngoStatus === 'rejected'
                  ? 'Your NGO account has been rejected. Update your profile details before you can accept pickups.'
                  : 'Your NGO account is pending verification. You can edit your profile now, but donation access will stay locked until approval.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const colors = colorClasses[card.color];
            const cardClass =
              'bg-white rounded-2xl shadow-lg transition-all ' +
              (isApprovedNgo ? 'hover:shadow-xl cursor-pointer' : 'opacity-70 cursor-not-allowed');

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={cardClass}
                onClick={() => {
                  if (isApprovedNgo) {
                    navigate(card.path);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={colors.bubble + ' p-3 rounded-xl'}>
                      <Icon className={'w-8 h-8 ' + colors.icon} />
                    </div>
                    <span className={'text-4xl font-bold ' + colors.text}>{card.value}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.label}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl shadow-lg p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold mb-2">Need more donation leads?</h2>
          <p className="text-white/90">
            {isApprovedNgo
              ? 'Open the live feed and accept the next matching pickup.'
              : 'Approval unlocks the live donation feed and pickup assignment tools.'}
          </p>
        </div>
        <button
          onClick={() => navigate(isApprovedNgo ? '/ngo/available-donations' : '/ngo/profile')}
          className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          {isApprovedNgo ? 'View Available' : 'Complete Profile'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {isApprovedNgo === false ? (
          <p className="text-gray-600">Recent pickup activity will appear after approval.</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-gray-600">No live pickup activity yet.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.text + '-' + index} className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
                <div className="bg-teal-500 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.text}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
