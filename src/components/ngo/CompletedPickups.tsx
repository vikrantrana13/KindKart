import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../lib/api';

interface PickupItem {
  name: string;
  quantity: string;
  unit?: string;
}

interface CompletedPickup {
  id: string;
  category: string;
  items: PickupItem[];
  completionDate: string;
  donor: string;
  location: string;
  rating?: number;
}

export function CompletedPickups() {
  const [pickups, setPickups] = useState<CompletedPickup[]>([]);
  const [showRating, setShowRating] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedPickups = async () => {
      try {
        const res = await fetch(`${API_BASE}/donations/completed-pickups`, {
          headers: getAuthHeaders(),
        });

        const data = await res.json();

        if (res.ok) {
          setPickups(data);
        } else {
          console.error("Failed to fetch completed pickups", data);
        }
      } catch (error) {
        console.error("Completed pickups error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedPickups();
  }, []);

  const handleRateDonor = (pickupId: string) => {
    setShowRating(pickupId);
    const existingPickup = pickups.find((pickup) => pickup.id === pickupId);
    setSelectedRating(existingPickup?.rating || 0);
  };

  const submitRating = async (pickupId: string) => {
    if (selectedRating === 0) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/donations/${pickupId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ rating: selectedRating }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Unable to save donor rating.');
        return;
      }

      setPickups((prev) =>
        prev.map((pickup) =>
          pickup.id === pickupId
            ? { ...pickup, rating: selectedRating }
            : pickup
        )
      );
      setShowRating(null);
      setSelectedRating(0);
    } catch (error) {
      console.error('Donor rating error:', error);
      alert('Server error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      food: { bg: 'bg-orange-100', text: 'text-orange-600' },
      clothes: { bg: 'bg-blue-100', text: 'text-blue-600' },
      stationary: { bg: 'bg-green-100', text: 'text-green-600' },
      household: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };

    return colors[category] || colors.household;
  };

  const totalItems = pickups.reduce((acc, pickup) => acc + pickup.items.length, 0);
  const ratedValues = pickups.map((pickup) => pickup.rating).filter((rating): rating is number => Boolean(rating));
  const averageRating =
    ratedValues.length > 0
      ? (ratedValues.reduce((acc, value) => acc + value, 0) / ratedValues.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Completed Pickups</h1>
        <p className="text-gray-600 mt-1">View your successfully completed donations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <p className="text-emerald-100 text-sm">Total Completed</p>
          <p className="text-4xl font-bold">{pickups.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <TrendingUp className="w-8 h-8 mb-3" />
          <p className="text-blue-100 text-sm">Total Item Lines Collected</p>
          <p className="text-4xl font-bold">{totalItems}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <Star className="w-8 h-8 mb-3" />
          <p className="text-purple-100 text-sm">Average Rating</p>
          <p className="text-4xl font-bold">{averageRating}</p>
        </motion.div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
          Loading completed pickups...
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed pickups yet</h3>
          <p className="text-gray-600">Complete your first pickup to see it here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Donor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pickups.map((pickup, index) => {
                  const categoryColor = getCategoryColor(pickup.category);
                  const rating = pickup.rating;

                  return (
                    <motion.tr
                      key={pickup.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-teal-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(pickup.completionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor.bg} ${categoryColor.text}`}>
                          {pickup.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pickup.items.length} item(s)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{pickup.donor}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{pickup.location}</td>
                      <td className="px-6 py-4">
                        {rating ? (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: rating }).map((_, starIndex) => (
                              <Star key={starIndex} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not rated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!rating && showRating !== pickup.id && (
                          <button
                            onClick={() => handleRateDonor(pickup.id)}
                            className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                          >
                            Rate Donor
                          </button>
                        )}
                        {showRating === pickup.id && (
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setSelectedRating(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= selectedRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <button
                              onClick={() => submitRating(pickup.id)}
                              disabled={selectedRating === 0}
                              className="ml-2 px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
