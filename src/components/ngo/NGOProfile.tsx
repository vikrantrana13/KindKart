import { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Tag, Save, Upload, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE, getAuthHeaders } from '../../lib/api';

const defaultNgoData = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  serviceCity: '',
  servicePincode: '',
  categoriesAccepted: [] as string[],
  description: '',
  logoDataUrl: '',
};

export function NGOProfile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [ngoData, setNgoData] = useState(defaultNgoData);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile/me`, {
          headers: getAuthHeaders(),
        });

        const data = await res.json();

        if (res.ok) {
          setNgoData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            specialization: data.specialization || 'General Welfare',
            serviceCity: data.serviceCity || '',
            servicePincode: data.servicePincode || '',
            categoriesAccepted: data.categoriesAccepted || [],
            description: data.description || '',
            logoDataUrl: data.logoDataUrl || '',
          });

          localStorage.setItem(
            'user',
            JSON.stringify({
              ...JSON.parse(localStorage.getItem('user') || '{}'),
              ...data,
            })
          );
        } else {
          console.error('Failed to load NGO profile', data);
        }
      } catch (error) {
        console.error('NGO profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(ngoData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Unable to update profile');
        return;
      }

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...data.user,
        })
      );

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('NGO profile update error:', error);
      alert('Server error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Unable to update password');
        return;
      }

      alert('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('NGO password update error:', error);
      alert('Server error');
    }
  };

  const toggleCategory = (category: string) => {
    setNgoData((prev) => ({
      ...prev,
      categoriesAccepted: prev.categoriesAccepted.includes(category)
        ? prev.categoriesAccepted.filter((item) => item !== category)
        : [...prev.categoriesAccepted, category],
    }));
  };

  const handleLogoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNgoData((prev) => ({
        ...prev,
        logoDataUrl: String(reader.result || ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    { id: 'food', label: 'Food', color: 'orange' },
    { id: 'clothes', label: 'Clothes', color: 'blue' },
    { id: 'stationary', label: 'Stationary', color: 'green' },
    { id: 'household', label: 'Household', color: 'purple' },
  ];

  const specializations = [
    'Children & Education',
    'Food Relief',
    'Elderly Care',
    'Disaster Relief',
    'Healthcare',
    'Animal Welfare',
    'Environmental',
    'General Welfare',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">NGO Profile</h1>
        <p className="text-gray-600 mt-1">Manage your organization's information</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
          Loading profile...
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden flex items-center justify-center">
                {ngoData.logoDataUrl ? (
                  <img src={ngoData.logoDataUrl} alt="NGO logo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold mb-2">{ngoData.name}</h2>
                <p className="text-teal-100">{ngoData.specialization}</p>
                <p className="text-sm text-teal-100 mt-1">
                  Serving {ngoData.serviceCity || 'your service area'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">NGO Logo</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl overflow-hidden flex items-center justify-center">
                {ngoData.logoDataUrl ? (
                  <img src={ngoData.logoDataUrl} alt="NGO logo preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-teal-600" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl font-semibold hover:bg-teal-100 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </button>
              <p className="text-sm text-gray-500">Recommended: 200x200px, PNG or JPG</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Basic Information
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NGO Name *</label>
                <input
                  type="text"
                  value={ngoData.name}
                  onChange={(e) => setNgoData({ ...ngoData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={ngoData.email}
                      onChange={(e) => setNgoData({ ...ngoData, email: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={ngoData.phone}
                      onChange={(e) => setNgoData({ ...ngoData, phone: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization *</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={ngoData.specialization}
                    onChange={(e) => setNgoData({ ...ngoData, specialization: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors appearance-none"
                  >
                    {specializations.map((specialization) => (
                      <option key={specialization} value={specialization}>
                        {specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Area (City) *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={ngoData.serviceCity}
                      onChange={(e) => setNgoData({ ...ngoData, serviceCity: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Pincode(s)</label>
                  <input
                    type="text"
                    value={ngoData.servicePincode}
                    onChange={(e) => setNgoData({ ...ngoData, servicePincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={ngoData.description}
                  onChange={(e) => setNgoData({ ...ngoData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Categories Accepted</h2>
            <p className="text-sm text-gray-600 mb-4">Select the types of donations your NGO can accept</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const isSelected = ngoData.categoriesAccepted.includes(category.id);
                const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
                  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500' },
                  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500' },
                  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500' },
                  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500' },
                };
                const colors = colorClasses[category.color];

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.border} ${colors.text}`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{category.label}</span>
                      {isSelected && <CheckCircle className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all"
              >
                Update Password
              </button>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
}
