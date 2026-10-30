import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Truck, MapPin, User, Phone, Calendar, CheckCircle, PackageCheck } from 'lucide-react';
import { API_BASE, buildGoogleMapsLink, getAuthHeaders } from '../../lib/api';

interface PickupItem {
  name: string;
  quantity: string;
  unit?: string;
  condition?: string;
}

interface Pickup {
  id: string;
  category: string;
  items: PickupItem[];
  photos?: string[];
  donor: { name: string; phone: string; anonymous: boolean };
  pickupAddress: string;
  pickupDate: string;
  pickupTime?: string;
  assignedDate: string;
  status: string;
  statusLabel: string;
  pickupLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export function MyPickups() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await fetch(`${API_BASE}/donations/my-pickups`, {
          headers: getAuthHeaders(),
        });

        const data = await res.json();

        if (res.ok) {
          setPickups(data);
        } else {
          console.error('Failed to fetch pickups', data);
        }
      } catch (error) {
        console.error('Pickup fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickups();
  }, []);

  const refreshPickupStatus = (pickupId: string, nextStatus: 'picked-up' | 'completed') => {
    if (nextStatus === 'completed') {
      setPickups((prev) => prev.filter((pickup) => pickup.id !== pickupId));
      return;
    }

    setPickups((prev) =>
      prev.map((pickup) =>
        pickup.id === pickupId
          ? { ...pickup, status: 'picked-up', statusLabel: 'Picked Up' }
          : pickup
      )
    );
  };

  const handleUpdatePickupStatus = async (pickupId: string, nextStatus: 'picked-up' | 'completed') => {
    const isCompletion = nextStatus === 'completed';
    const confirmMessage = isCompletion
      ? 'Mark this pickup as completed?'
      : 'Mark this pickup as picked up?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/donations/${pickupId}/${isCompletion ? 'complete' : 'pickup'}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await res.json();

      if (res.ok) {
        refreshPickupStatus(pickupId, nextStatus);
        alert(isCompletion ? 'Pickup marked as completed.' : 'Pickup marked as picked up.');
      } else {
        alert(data.message || 'Unable to update pickup status.');
      }
    } catch (error) {
      console.error('Pickup status error:', error);
      alert('Server error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      food: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
      clothes: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
      stationary: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
      household: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
    };

    return colors[category] || colors.household;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'picked-up') {
      return 'bg-purple-100 text-purple-700';
    }

    return 'bg-blue-100 text-blue-700';
  };

  const formatTimeSlot = (value?: string) => {
    if (value === 'morning') {
      return 'Morning (9 AM - 12 PM)';
    }

    if (value === 'afternoon') {
      return 'Afternoon (12 PM - 3 PM)';
    }

    if (value === 'evening') {
      return 'Evening (3 PM - 6 PM)';
    }

    return value || 'Not specified';
  };

  const assignedCount = pickups.filter((pickup) => pickup.status === 'assigned').length;
  const pickedUpCount = pickups.filter((pickup) => pickup.status === 'picked-up').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Pickups</h1>
        <p className="text-gray-600 mt-1">Manage your assigned donation pickups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <Truck className="w-8 h-8 mb-3" />
          <p className="text-blue-100 text-sm">Active Pickups</p>
          <p className="text-4xl font-bold">{pickups.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <p className="text-orange-100 text-sm">Awaiting Collection</p>
          <p className="text-4xl font-bold">{assignedCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-lg p-6 text-white"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <p className="text-emerald-100 text-sm">Ready To Complete</p>
          <p className="text-4xl font-bold">{pickedUpCount}</p>
        </motion.div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
          Loading pickups...
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No active pickups</h3>
          <p className="text-gray-600">Accepted donations will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pickups.map((pickup, index) => {
            const categoryColor = getCategoryColor(pickup.category);

            return (
              <motion.div
                key={pickup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg p-6 border ${categoryColor.border}`}
              >
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor.bg} ${categoryColor.text}`}>
                        {pickup.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(pickup.status)}`}>
                        {pickup.statusLabel}
                      </span>
                      <span className="text-sm text-gray-600">
                        Assigned on {new Date(pickup.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {pickup.photos && pickup.photos.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Donation Photos</h3>
                      <div className="grid grid-cols-3 gap-3 max-w-md">
                        {pickup.photos.map((photo, photoIndex) => (
                          <img
                            key={photo.slice(0, 32) + photoIndex}
                            src={photo}
                            alt={`Pickup donation photo ${photoIndex + 1}`}
                            className="h-24 w-full rounded-xl object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                    <div className="space-y-1">
                      {pickup.items.map((item, itemIndex) => (
                        <p key={`${pickup.id}-${itemIndex}`} className="text-gray-700">
                          {item.name} - {item.quantity} {item.unit || item.condition || 'items'}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Pickup Address</p>
                        <p className="text-sm text-gray-700">{pickup.pickupAddress}</p>
                        {buildGoogleMapsLink(pickup.pickupLocation || {}) ? (
                          <a
                            href={buildGoogleMapsLink(pickup.pickupLocation || {})}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
                          >
                            Open in Google Maps
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <User className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">Donor Contact</p>
                          <p className="text-sm text-gray-700">
                            {pickup.donor.anonymous ? 'Anonymous Donor' : pickup.donor.name}
                          </p>
                        </div>
                      </div>
                      {!pickup.donor.anonymous && pickup.donor.phone && (
                        <div className="flex items-center gap-2 ml-7">
                          <Phone className="w-4 h-4 text-teal-600" />
                          <p className="text-sm text-gray-700">{pickup.donor.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Scheduled Pickup Date</p>
                      <p className="text-sm text-blue-600">
                        {pickup.pickupDate
                          ? new Date(pickup.pickupDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Not specified'}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {formatTimeSlot(pickup.pickupTime)}
                      </p>
                    </div>
                  </div>

                  {pickup.status === 'assigned' ? (
                    <button
                      onClick={() => handleUpdatePickupStatus(pickup.id, 'picked-up')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <PackageCheck className="w-5 h-5" />
                      Mark As Picked Up
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdatePickupStatus(pickup.id, 'completed')}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark As Completed
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
