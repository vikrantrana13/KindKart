import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  UtensilsCrossed, 
  Shirt, 
  BookOpen, 
  Home,
  Plus,
  X,
  ArrowRight,
  Check,
  AlertCircle,
  Calendar,
  Clock,
  Trash2,
  ImagePlus
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_BASE } from '../../lib/api';
import { PickupLocationField } from './PickupLocationField';

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface ClothingItem {
  id: string;
  name: string;
  quantity: string;
  condition: string;
}

interface StationaryItem {
  id: string;
  name: string;
  quantity: string;
  condition: string;
}

interface HouseholdItem {
  id: string;
  name: string;
  quantity: string;
  condition: string;
}

interface DonationItem {
  id: string;
  category: string;
  data: any;
}

interface PickupDetails {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
  preferredDate: string;
  preferredTime: string;
}

export function NewDonation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'pickup' | 'category' | 'form'>('pickup');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);
  const [pickupDetails, setPickupDetails] = useState<PickupDetails>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    placeId: '',
    latitude: null,
    longitude: null,
    preferredDate: '',
    preferredTime: ''
  });
  const [showNGOMessage, setShowNGOMessage] = useState(false);
  const [donationPhotos, setDonationPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Unable to read selected image'));
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const remainingSlots = 3 - donationPhotos.length;

    if (remainingSlots <= 0) {
      alert('You can upload up to 3 donation photos only.');
      event.target.value = '';
      return;
    }

    try {
      const selectedFiles = files.slice(0, remainingSlots);
      const photoData = await Promise.all(selectedFiles.map((file) => readFileAsDataUrl(file)));
      setDonationPhotos((prev) => [...prev, ...photoData.filter(Boolean)]);
    } catch (error) {
      console.error(error);
      alert('Unable to process the selected images.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setDonationPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const categories = [
    { id: 'food', label: 'Food', icon: UtensilsCrossed, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { id: 'clothes', label: 'Clothes', icon: Shirt, color: 'from-blue-500 to-purple-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { id: 'stationary', label: 'Stationary', icon: BookOpen, color: 'from-green-500 to-teal-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { id: 'household', label: 'Household Items', icon: Home, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  ];

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupDetails.pincode.length === 6) {
      setShowNGOMessage(true);
      setTimeout(() => {
        setStep('category');
      }, 1500);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('form');
  };

  const handleAddCategoryDonation = (categoryData: any) => {
    const newItem: DonationItem = {
      id: Date.now().toString(),
      category: selectedCategory,
      data: categoryData
    };
    setDonationItems([...donationItems, newItem]);
    setStep('category');
  };

  const handleRemoveItem = (itemId: string) => {
    setDonationItems(donationItems.filter(item => item.id !== itemId));
  };

const handleFinalSubmit = async () => {
  if (isSubmitting) {
    return;
  }

  if (donationPhotos.length === 0) {
    alert('Upload at least one photo of the donation items.');
    return;
  }

  try {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const donation = {
      pickup: pickupDetails,
      items: donationItems,
      photos: donationPhotos
    };

    const response = await fetch(`${API_BASE}/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // if your backend uses JWT
      },
      body: JSON.stringify(donation)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Donation submitted successfully!");
      navigate("/donor/my-donations");
    } else {
      alert(data.message || "Failed to submit donation");
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Server error");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'pickup' || step === 'category' || step === 'form' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step === 'category' || step === 'form' ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">Pickup Details</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full transition-all ${step === 'category' || step === 'form' ? 'bg-emerald-500 w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'category' || step === 'form' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step === 'form' && donationItems.length > 0 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">Select Category</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full transition-all ${donationItems.length > 0 ? 'bg-emerald-500 w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${donationItems.length > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              3
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">Add Items</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Pickup Details */}
        {step === 'pickup' && (
          <motion.div
            key="pickup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pickup Details</h2>
            </div>

            <form onSubmit={handlePickupSubmit} className="space-y-4">
              <PickupLocationField
                onLocationSelect={(location) =>
                  setPickupDetails((prev) => ({
                    ...prev,
                    address: location.address || prev.address,
                    city: location.city || prev.city,
                    state: location.state || prev.state,
                    pincode: location.pincode || prev.pincode,
                    placeId: location.placeId,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }))
                }
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Address *
                </label>
                <textarea
                  value={pickupDetails.address}
                  onChange={(e) => setPickupDetails({...pickupDetails, address: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={pickupDetails.city}
                    onChange={(e) => setPickupDetails({...pickupDetails, city: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={pickupDetails.state}
                    onChange={(e) => setPickupDetails({...pickupDetails, state: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={pickupDetails.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPickupDetails({...pickupDetails, pincode: value});
                    }}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Enter pincode"
                  />
                  {showNGOMessage && pickupDetails.pincode.length === 6 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-emerald-600 mt-2 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      NGOs available in your area: 3
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={pickupDetails.landmark}
                    onChange={(e) => setPickupDetails({...pickupDetails, landmark: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Pickup Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={pickupDetails.preferredDate}
                      onChange={(e) => setPickupDetails({...pickupDetails, preferredDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={pickupDetails.preferredTime}
                      onChange={(e) => setPickupDetails({...pickupDetails, preferredTime: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                      <option value="">Select time slot</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                      <option value="evening">Evening (3 PM - 6 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Continue to Category Selection
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Category Selection */}
        {step === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Added Items Summary */}
            {donationItems.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Items Added ({donationItems.length})</h3>
                <div className="space-y-2">
                  {donationItems.map((item) => {
                    const category = categories.find(c => c.id === item.category);
                    const Icon = category?.icon || Home;
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/30 p-2 rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{category?.label}</p>
                            <p className="text-sm text-emerald-100">
                              {item.category === 'food' 
                                ? `${item.data.items?.length || 0} food items` 
                                : item.category === 'clothes'
                                ? `${item.data.items?.length || 0} clothing items`
                                : item.category === 'stationary'
                                ? `${item.data.items?.length || 0} stationary items`
                                : `${item.data.items?.length || 0} household items`
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-white/20 hover:bg-red-500 p-2 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold">Donation Photos</p>
                      <p className="text-sm text-emerald-100">Upload up to 3 images so NGOs can verify the items quickly.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-600 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-emerald-50 transition-colors">
                      <ImagePlus className="w-4 h-4" />
                      Add Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {donationPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {donationPhotos.map((photo, index) => (
                        <div key={photo.slice(0, 32) + index} className="relative overflow-hidden rounded-xl bg-white/10">
                          <img src={photo} alt={'Donation photo ' + (index + 1)} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-100">No photos added yet.</p>
                  )}
                </div>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-white text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting Donation...' : 'Submit All Donations'}
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Donation Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-2xl p-6 text-left group shadow-lg hover:shadow-xl transition-all bg-gradient-to-br ${category.color}`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl inline-block mb-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{category.label}</h3>
                        <p className="text-white/80 text-sm">Click to add {category.label.toLowerCase()}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Dynamic Form Based on Category */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedCategory === 'food' && <FoodForm onSubmit={handleAddCategoryDonation} onBack={() => setStep('category')} />}
            {selectedCategory === 'clothes' && <ClothesForm onSubmit={handleAddCategoryDonation} onBack={() => setStep('category')} />}
            {selectedCategory === 'stationary' && <StationaryForm onSubmit={handleAddCategoryDonation} onBack={() => setStep('category')} />}
            {selectedCategory === 'household' && <HouseholdForm onSubmit={handleAddCategoryDonation} onBack={() => setStep('category')} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Food Form Component with Dynamic Items
function FoodForm({ onSubmit, onBack }: any) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: '1', name: '', quantity: '', unit: '' }
  ]);
  const [commonData, setCommonData] = useState({
    foodType: '',
    condition: '',
    preparedTime: '',
    expiryTime: ''
  });

  const addFoodItem = () => {
    setFoodItems([...foodItems, { id: Date.now().toString(), name: '', quantity: '', unit: '' }]);
  };

  const removeFoodItem = (id: string) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter(item => item.id !== id));
    }
  };

  const updateFoodItem = (id: string, field: keyof FoodItem, value: string) => {
    setFoodItems(foodItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items: foodItems, ...commonData });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-3 rounded-xl">
          <UtensilsCrossed className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Food Donation Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Please ensure that the food is fresh and not stale. Expired or spoiled food will not be accepted.
          </p>
        </div>

        {/* Dynamic Food Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Food Items</h3>
          {foodItems.map((item, index) => (
            <div key={item.id} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Food Item {index + 1}</span>
                {foodItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFoodItem(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name *</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateFoodItem(item.id, 'name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Dal, Rice, Chapati, Vegetables"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateFoodItem(item.id, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                  <select
                    value={item.unit}
                    onChange={(e) => updateFoodItem(item.id, 'unit', e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select unit</option>
                    <option value="kg">Kilograms (Kg)</option>
                    <option value="grams">Grams</option>
                    <option value="pieces">Pieces</option>
                    <option value="packets">Packets</option>
                    <option value="plates">Plates</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFoodItem}
            className="w-full py-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-emerald-600 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Food Item
          </button>
        </div>

        {/* Common Fields for All Food Items */}
        <div className="border-t-2 border-gray-200 pt-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Common Details (for all items)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Food Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="foodType"
                    value="veg"
                    checked={commonData.foodType === 'veg'}
                    onChange={(e) => setCommonData({...commonData, foodType: e.target.value})}
                    required
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="foodType"
                    value="nonveg"
                    checked={commonData.foodType === 'nonveg'}
                    onChange={(e) => setCommonData({...commonData, foodType: e.target.value})}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Non-Vegetarian</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Food Condition *</label>
              <select
                value={commonData.condition}
                onChange={(e) => setCommonData({...commonData, condition: e.target.value})}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Select condition</option>
                <option value="freshly-cooked">Freshly Cooked</option>
                <option value="packaged">Packaged</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prepared Time</label>
              <input
                type="datetime-local"
                value={commonData.preparedTime}
                onChange={(e) => setCommonData({...commonData, preparedTime: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Time</label>
              <input
                type="datetime-local"
                value={commonData.expiryTime}
                onChange={(e) => setCommonData({...commonData, expiryTime: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Food Donation
          </button>
        </div>
      </form>
    </div>
  );
}

// Clothes Form Component with Dynamic Items
function ClothesForm({ onSubmit, onBack }: any) {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([
    { id: '1', name: '', quantity: '', condition: '' }
  ]);

  const addClothingItem = () => {
    setClothingItems([...clothingItems, { id: Date.now().toString(), name: '', quantity: '', condition: '' }]);
  };

  const removeClothingItem = (id: string) => {
    if (clothingItems.length > 1) {
      setClothingItems(clothingItems.filter(item => item.id !== id));
    }
  };

  const updateClothingItem = (id: string, field: keyof ClothingItem, value: string) => {
    setClothingItems(clothingItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items: clothingItems });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Shirt className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Clothes Donation Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Clothing Items</h3>
          {clothingItems.map((item, index) => (
            <div key={item.id} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Clothing Item {index + 1}</span>
                {clothingItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeClothingItem(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateClothingItem(item.id, 'name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Men's Shirts, Blankets, Kids Jackets"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateClothingItem(item.id, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Number of items"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
                  <select
                    value={item.condition}
                    onChange={(e) => updateClothingItem(item.id, 'condition', e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="new">New</option>
                    <option value="used">Gently Used</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addClothingItem}
            className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl text-blue-600 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Clothing Item
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Clothes Donation
          </button>
        </div>
      </form>
    </div>
  );
}

// Stationary Form Component with Dynamic Items
function StationaryForm({ onSubmit, onBack }: any) {
  const [stationaryItems, setStationaryItems] = useState<StationaryItem[]>([
    { id: '1', name: '', quantity: '', condition: '' }
  ]);

  const addStationaryItem = () => {
    setStationaryItems([...stationaryItems, { id: Date.now().toString(), name: '', quantity: '', condition: '' }]);
  };

  const removeStationaryItem = (id: string) => {
    if (stationaryItems.length > 1) {
      setStationaryItems(stationaryItems.filter(item => item.id !== id));
    }
  };

  const updateStationaryItem = (id: string, field: keyof StationaryItem, value: string) => {
    setStationaryItems(stationaryItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items: stationaryItems });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-xl">
          <BookOpen className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Stationary Donation Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Stationary Items</h3>
          {stationaryItems.map((item, index) => (
            <div key={item.id} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Stationary Item {index + 1}</span>
                {stationaryItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStationaryItem(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateStationaryItem(item.id, 'name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Books, Notebooks, Pens, Art Supplies"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateStationaryItem(item.id, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Number of items"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
                  <select
                    value={item.condition}
                    onChange={(e) => updateStationaryItem(item.id, 'condition', e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addStationaryItem}
            className="w-full py-3 border-2 border-dashed border-green-300 hover:border-green-500 rounded-xl text-green-600 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Stationary Item
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Stationary Donation
          </button>
        </div>
      </form>
    </div>
  );
}

// Household Form Component with Dynamic Items
function HouseholdForm({ onSubmit, onBack }: any) {
  const [householdItems, setHouseholdItems] = useState<HouseholdItem[]>([
    { id: '1', name: '', quantity: '', condition: '' }
  ]);

  const addHouseholdItem = () => {
    setHouseholdItems([...householdItems, { id: Date.now().toString(), name: '', quantity: '', condition: '' }]);
  };

  const removeHouseholdItem = (id: string) => {
    if (householdItems.length > 1) {
      setHouseholdItems(householdItems.filter(item => item.id !== id));
    }
  };

  const updateHouseholdItem = (id: string, field: keyof HouseholdItem, value: string) => {
    setHouseholdItems(householdItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items: householdItems });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-xl">
          <Home className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Household Items Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Household Items</h3>
          {householdItems.map((item, index) => (
            <div key={item.id} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Household Item {index + 1}</span>
                {householdItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHouseholdItem(item.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateHouseholdItem(item.id, 'name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="e.g., Kitchen Utensils, Bedsheets, Furniture"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateHouseholdItem(item.id, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Number of items"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
                  <select
                    value={item.condition}
                    onChange={(e) => updateHouseholdItem(item.id, 'condition', e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addHouseholdItem}
            className="w-full py-3 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl text-purple-600 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Household Item
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Household Donation
          </button>
        </div>
      </form>
    </div>
  );
}
