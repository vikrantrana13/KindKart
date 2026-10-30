import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Clock, MapPin, Package, Star } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { API_BASE } from "../../lib/api";

export function DonationDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);

  useEffect(() => {

    const fetchDonation = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/donations/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      const selected = data.find((d:any) => d.id == id);

      setDonation(selected);
    };

    fetchDonation();

  }, [id]);

  if (!donation) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      {/* Back Button */}

    <button
      onClick={() => navigate("/donor/my-donations")}
      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
    >
      <ArrowLeft className="w-5 h-5" />
      Back to My Donations
    </button>


      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">

        <h2 className="text-2xl font-bold mb-2">
          Donation Details
        </h2>

        <p className="text-emerald-100">
          Track your donation and pickup information
        </p>

      </div>


      {/* Status Card */}

      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">

        <div className="bg-yellow-100 p-3 rounded-xl">
          <Clock className="text-yellow-600 w-6 h-6"/>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-lg font-semibold capitalize">{donation.status}</p>
        </div>

        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {new Date(donation.date).toLocaleDateString()}
          </p>
        </div>

      </div>


      {/* Pickup Card */}

      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">

        <div className="bg-blue-100 p-3 rounded-xl">
          <MapPin className="text-blue-600 w-6 h-6"/>
        </div>

        <div>
          <p className="text-sm text-gray-500">Pickup Location</p>
          <p className="text-lg font-semibold">
            {donation.pickup.city}, {donation.pickup.state}
          </p>
          {donation.ngo?.name ? (
            <p className="text-sm text-gray-500 mt-1">NGO: {donation.ngo.name}</p>
          ) : null}
        </div>

      </div>

      {donation.donorRating ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Star className="text-amber-500 w-6 h-6 fill-amber-500" />
          </div>

          <div>
            <p className="text-sm text-gray-500">NGO Rating For You</p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: donation.donorRating }).map((_, index) => (
                <Star key={index} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
      ) : null}


      {/* Items Card */}

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="flex items-center gap-3 mb-4">
          <Package className="text-emerald-600 w-6 h-6"/>
          <h3 className="text-xl font-semibold">Items Donated</h3>
        </div>

        <div className="space-y-3">

          {donation.items.map((item:any, i:number)=>(

            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3"
            >

              <span className="font-medium">
                {item.category}
              </span>

              <span className="text-gray-600">
                {item.data.quantity} {item.data.unit}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
