import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE, getAuthHeaders } from '../../lib/api';

interface Donation {
  id: string;
  status: string;
  items: Array<{ category: string }>;
}

export function DonorHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    pickedUp: 0,
    completed: 0,
    itemsDonated: 0,
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [myRes, historyRes] = await Promise.all([
          fetch(`${API_BASE}/donations/my`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/donations/history`, { headers: getAuthHeaders() }),
        ]);

        const [myDonations, history] = await Promise.all([myRes.json(), historyRes.json()]);

        if (!myRes.ok || !historyRes.ok) {
          console.error('Failed to load donor dashboard', { myDonations, history });
          return;
        }

        const allDonations: Donation[] = [...myDonations, ...history];

        setStats({
          pending: allDonations.filter((donation) => donation.status === 'pending').length,
          assigned: allDonations.filter((donation) => donation.status === 'assigned').length,
          pickedUp: allDonations.filter((donation) => donation.status === 'picked-up').length,
          completed: allDonations.filter((donation) => donation.status === 'completed').length,
          itemsDonated: allDonations.reduce((acc, donation) => acc + donation.items.length, 0),
        });

        setRecentActivity(
          allDonations
            .slice(0, 3)
            .map((donation) => `${donation.status === 'picked-up' ? 'picked up' : donation.status} donation with ${donation.items.length} item(s)`)
        );
      } catch (error) {
        console.error('Donor dashboard error:', error);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-8"
      >
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {user.name || 'Donor'}
          </h1>
          <p className="text-emerald-50 text-lg">Ready to make a difference today?</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button
          onClick={() => navigate('/donor/new-donation')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-2xl shadow-xl transition-all p-8 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create New Donation</h2>
              <p className="text-blue-100">Share your surplus items with those in need</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </button>
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
            onClick={() => navigate('/donor/my-donations')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <span className="text-yellow-500 text-4xl font-bold">{stats.pending}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Donations</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
            onClick={() => navigate('/donor/my-donations')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-blue-500 text-4xl font-bold">{stats.assigned + stats.pickedUp}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active NGO Pickups</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
            onClick={() => navigate('/donor/history')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="text-emerald-500 text-4xl font-bold">{stats.completed}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Completed Donations</h3>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed Donations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{stats.itemsDonated}</p>
            <p className="text-sm text-gray-600">Item Lines Donated</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600 mb-1">{stats.pending + stats.assigned + stats.pickedUp}</p>
            <p className="text-sm text-gray-600">Active Donations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600 mb-1">{stats.completed * 3}</p>
            <p className="text-sm text-gray-600">Estimated Families Helped</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-600">Your recent donation activity will appear here.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={`${activity}-${index}`} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 capitalize">{activity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
