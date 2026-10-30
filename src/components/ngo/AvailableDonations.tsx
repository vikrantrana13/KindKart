import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, User, Package, Sparkles, Filter, ShieldAlert, Calendar, Clock } from 'lucide-react';
import { API_BASE, buildGoogleMapsLink, getAuthHeaders } from '../../lib/api';

interface DonationItem {
  name: string;
  quantity: string;
  unit?: string;
  condition?: string;
  category?: string;
}

interface Donation {
  id: string;
  category: string;
  items: DonationItem[];
  photos: string[];
  donor: { name: string; anonymous: boolean };
  location: { city: string; state: string; latitude?: number | null; longitude?: number | null };
  pickup: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number | null;
    longitude?: number | null;
    preferredDate?: string;
    preferredTime?: string;
  };
  priority: 'high' | 'medium' | 'low';
  aiMatch: number;
  date: string;
  status: string;
}

export function AvailableDonations() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [sortBy, setSortBy] = useState('priority');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [accessMessage, setAccessMessage] = useState('');

  const ngoStatus = user.ngoVerificationStatus || 'pending';

  useEffect(() => {
    if (ngoStatus !== 'approved') {
      setAccessMessage(
        ngoStatus === 'rejected'
          ? 'Your NGO account was rejected. Donation access is disabled until verification is restored.'
          : 'Your NGO account is pending verification. Available donations will unlock after review.'
      );
      setLoading(false);
      return;
    }

    const getDonations = async () => {
      try {
        const res = await fetch(API_BASE + '/donations/available', {
          headers: getAuthHeaders(),
        });

        const data = await res.json();

        if (res.ok) {
          setDonations(data);
          setAccessMessage('');
        } else {
          setAccessMessage(data.message || 'Failed to fetch donations');
        }
      } catch (error) {
        console.error('Error:', error);
        setAccessMessage('Unable to load donations right now.');
      } finally {
        setLoading(false);
      }
    };

    getDonations();
  }, [ngoStatus]);

  const handleAcceptPickup = async (donationId: string) => {
    try {
      const res = await fetch(API_BASE + '/donations/' + donationId + '/accept', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await res.json();

      if (res.ok) {
        setDonations((prev) => prev.filter((donation) => donation.id !== donationId));
        alert('Pickup accepted successfully!');
      } else {
        alert(data.message || 'Failed to accept donation');
      }
    } catch (error) {
      console.error(error);
      alert('Server error');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      food: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      clothes: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      stationary: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      household: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    };

    return colors[category] || colors.household;
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      high: { bg: 'bg-red-100', text: 'text-red-600', label: 'High Priority' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Medium Priority' },
      low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low Priority' },
    };

    return configs[priority] || configs.medium;
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

  const sortedDonations = [...donations].sort((a, b) => {
    if (sortBy === 'priority') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }

    if (sortBy === 'aiMatch') {
      return b.aiMatch - a.aiMatch;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredDonations =
    filterCategory === 'all'
      ? sortedDonations
      : sortedDonations.filter((donation) => donation.category === filterCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Donations</h1>
        <p className="text-gray-600 mt-1">Browse and accept donations</p>
      </div>

      {accessMessage ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="text-amber-600 w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Donation access locked</p>
            <p className="text-sm text-amber-700">{accessMessage}</p>
          </div>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-purple-100 border border-purple-200 rounded-xl p-4 flex gap-3"
      >
        <Sparkles className="text-purple-600 w-5 h-5" />
        <div>
          <p className="font-semibold text-purple-900">Smart sorting enabled</p>
          <p className="text-sm text-purple-700">Food donations are prioritized and matching scores are surfaced first.</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow p-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border p-3 rounded-lg mt-2"
            disabled={ngoStatus !== 'approved'}
          >
            <option value="all">All</option>
            <option value="food">Food</option>
            <option value="clothes">Clothes</option>
            <option value="stationary">Stationary</option>
            <option value="household">Household</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border p-3 rounded-lg mt-2"
            disabled={ngoStatus !== 'approved'}
          >
            <option value="priority">Priority</option>
            <option value="aiMatch">AI Match</option>
            <option value="date">Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">Loading available donations...</div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {ngoStatus === 'approved' ? 'No available donations' : 'Approval required'}
          </h3>
          <p className="text-gray-600">
            {ngoStatus === 'approved' ? 'New donation requests will appear here when donors submit them.' : accessMessage}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDonations.map((donation, index) => {
            const categoryColor = getCategoryColor(donation.category);
            const priorityConfig = getPriorityConfig(donation.priority);

            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={'bg-white rounded-2xl shadow-lg p-6 border ' + categoryColor.border}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + categoryColor.bg + ' ' + categoryColor.text}>
                        {donation.category}
                      </span>
                      <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + priorityConfig.bg + ' ' + priorityConfig.text}>
                        {priorityConfig.label}
                      </span>
                      <span className="text-sm text-purple-600 font-semibold">{donation.aiMatch}% match</span>
                    </div>

                    {donation.photos?.length > 0 ? (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Photos</p>
                        <div className="grid grid-cols-3 gap-3 max-w-md">
                          {donation.photos.map((photo, photoIndex) => (
                            <img
                              key={photo.slice(0, 32) + photoIndex}
                              src={photo}
                              alt={`Donation photo ${photoIndex + 1}`}
                              className="h-24 w-full rounded-xl object-cover border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Donor</p>
                          <p className="font-semibold text-gray-900">{donation.donor.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-semibold text-gray-900">
                            {donation.location.city}, {donation.location.state}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Preferred Pickup Date</p>
                          <p className="font-semibold text-gray-900">
                            {donation.pickup?.preferredDate
                              ? new Date(donation.pickup.preferredDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Not specified'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeSlot(donation.pickup?.preferredTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Items</p>
                      <div className="flex flex-wrap gap-2">
                        {donation.items.map((item, itemIndex) => (
                          <span
                            key={donation.id + '-' + itemIndex}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            {item.name} ({item.quantity} {item.unit || 'items'})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm text-gray-500">Posted on {new Date(donation.date).toLocaleDateString()}</p>
                      {buildGoogleMapsLink({
                        latitude: donation.pickup?.latitude ?? donation.location.latitude,
                        longitude: donation.pickup?.longitude ?? donation.location.longitude,
                        address: donation.pickup?.address,
                        city: donation.pickup?.city || donation.location.city,
                        state: donation.pickup?.state || donation.location.state,
                        pincode: donation.pickup?.pincode,
                      }) ? (
                        <a
                          href={buildGoogleMapsLink({
                            latitude: donation.pickup?.latitude ?? donation.location.latitude,
                            longitude: donation.pickup?.longitude ?? donation.location.longitude,
                            address: donation.pickup?.address,
                            city: donation.pickup?.city || donation.location.city,
                            state: donation.pickup?.state || donation.location.state,
                            pincode: donation.pickup?.pincode,
                          })}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                        >
                          Open in Google Maps
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:w-52">
                    <button
                      onClick={() => handleAcceptPickup(donation.id)}
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all"
                    >
                      Accept Pickup
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
