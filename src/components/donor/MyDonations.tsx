import { useState, useEffect } from "react";
import { Clock, Package, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { API_BASE } from "../../lib/api";

interface DonationItem {
  category: string;
  data: {
    quantity: number;
    unit: string;
  };
}

interface Pickup {
  city: string;
  state: string;
}

interface Donation {
  id: string;
  items: DonationItem[];
  photos: string[];
  status: string;
  date: string;
  pickup: Pickup;
  ngo?: { name?: string } | null;
  donorRating?: number | null;
}

export function MyDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/donations/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setDonations(data);
        } else {
          console.error("Failed to fetch donations");
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
      }
    };

    fetchDonations();
  }, []);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: typeof Clock; label: string; bgColor: string; textColor: string; borderColor: string }> = {
      pending: { icon: Clock, label: "Pending", bgColor: "bg-yellow-50", textColor: "text-yellow-600", borderColor: "border-yellow-200" },
      assigned: { icon: Package, label: "Assigned", bgColor: "bg-blue-50", textColor: "text-blue-600", borderColor: "border-blue-200" },
      "picked-up": { icon: CheckCircle, label: "Picked Up", bgColor: "bg-purple-50", textColor: "text-purple-600", borderColor: "border-purple-200" },
      completed: { icon: CheckCircle, label: "Completed", bgColor: "bg-emerald-50", textColor: "text-emerald-600", borderColor: "border-emerald-200" },
      withdrawn: { icon: XCircle, label: "Withdrawn", bgColor: "bg-red-50", textColor: "text-red-600", borderColor: "border-red-200" },
      expired: { icon: AlertCircle, label: "Expired", bgColor: "bg-gray-50", textColor: "text-gray-600", borderColor: "border-gray-200" },
    };

    return configs[status] || configs.pending;
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this donation?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/donations/withdraw/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setDonations((prev) => prev.map((donation) => (donation.id === id ? { ...donation, status: "withdrawn" } : donation)));
        alert("Donation withdrawn successfully");
      } else {
        alert(data.message || "Withdraw failed");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const activeDonations = donations.filter((donation) => donation.status !== "withdrawn" && donation.status !== "completed");
  const filteredDonations = filter === "all" ? activeDonations : activeDonations.filter((donation) => donation.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
          <p className="text-gray-600 mt-1">Track and manage your donation requests</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "assigned", "picked-up", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === status ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-emerald-50"
              }`}
            >
              {status === "all" ? "All" : status === "picked-up" ? "Picked Up" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No donations found</h3>
          <p className="text-gray-600">Start making a difference by creating your first donation</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDonations.map((donation, index) => {
            const statusConfig = getStatusConfig(donation.status);
            const Icon = statusConfig.icon;

            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${statusConfig.borderColor}`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${statusConfig.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${statusConfig.textColor}`} />
                      </div>

                      <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>

                      <span className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</span>
                    </div>

                    {donation.photos?.length > 0 ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Photos:</p>
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

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {donation.items && donation.items.length > 0 ? (
                            donation.items.map((item, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                {item.category} ({item.data.quantity} {item.data.unit})
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No items</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Pickup: {donation.pickup?.city}, {donation.pickup?.state}</p>
                        {donation.ngo?.name ? (
                          <p className="text-sm text-gray-600">Accepted by: {donation.ngo.name}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => navigate(`/donor/donation/${donation.id}`)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {(donation.status === "pending" || donation.status === "assigned") && (
                      <button
                        onClick={() => handleWithdraw(donation.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                      >
                        Withdraw
                      </button>
                    )}
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
