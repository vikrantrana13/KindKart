import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, TrendingUp, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE } from '../../lib/api';

export function DonationHistory() {
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {

  const fetchHistory = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/donations/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
              const history = data.filter(
        (d: any) => d.status === "withdrawn" || d.status === "completed"
      );

      setDonations(history);
      }

    } catch (error) {
      console.error("Error fetching history:", error);
    }

  };

  fetchHistory();

}, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-600 mt-1">Your completed contributions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <p className="text-emerald-100 text-sm">Total Donations</p>
          <p className="text-4xl font-bold">{donations.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <TrendingUp className="w-8 h-8 mb-3" />
          <p className="text-blue-100 text-sm">Items Donated</p>
          <p className="text-4xl font-bold">{donations.reduce((acc, d) => acc + d.items.length, 0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <p className="text-purple-100 text-sm">This Month</p>
          <p className="text-4xl font-bold">
            {donations.filter(d => {
              const date = new Date(d.date);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </motion.div>
      </div>

      {/* History List */}
      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed donations yet</h3>
          <p className="text-gray-600">Your completed donations will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">NGO Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((donation, index) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(donation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.items.length} item(s)
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {donation.items.map((item: any, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.pickup?.city}, {donation.pickup?.state}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.donorRating ? (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: donation.donorRating }).map((_, starIndex) => (
                            <Star key={starIndex} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {donation.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
