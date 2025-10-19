import React, { useEffect, useState } from "react";
import { Package, MessageCircle } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext"; // ✅ added

const BrowseDonations = () => {
  const { user } = useAuth(); // ✅ NGO verification awareness
  const [donations, setDonations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const BASE_URL = "http://localhost:5000";

  const fetchDonations = async () => {
    try {
      const res = await API.get("/donations");
      setDonations(res.data || []);
    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load donations");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAcceptPickup = async (donationId) => {
    if (user?.role === "ngo" && !user?.verified) {
      toast.error("Your NGO is not verified yet. Please wait for admin approval.");
      return;
    }

    try {
      await API.post(`/accept/${donationId}`);
      toast.success("Pickup accepted successfully!");
      fetchDonations();
    } catch (err) {
      console.error("Error accepting donation:", err.response?.data || err.message);
      toast.error("Error accepting donation");
    }
  };

  const openCall = (phone) => {
    if (!phone) return toast.error("Phone number not available");
    window.location.href = `tel:${phone}`;
  };

  const openDirections = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const openWhatsApp = (phone, name, title) => {
    if (!phone) return toast.error("WhatsApp number not available");
    const msg = `Hello ${name || "Donor"}, I am interested in your donation (${title}).`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const statusMap = {
    available: "Pending",
    pending_pickup: "Pending",
    claimed: "Accepted",
    delivered: "Completed",
    completed: "Completed",
  };

  const filteredDonations = donations.filter((donation) => {
    if (filterStatus === "All") return true;
    return statusMap[donation.status] === filterStatus;
  });

  return (
    <div className="p-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
        <Package className="text-yellow-500" />
        Available Donations
      </h2>

      {/* 🟡 NGO verification warning */}
      {user?.role === "ngo" && !user?.verified && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          ⚠️ Your NGO verification is pending. You cannot accept donations until approved by the admin.
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-yellow-50 border border-yellow-200 rounded-full w-fit mb-6 overflow-hidden">
        {["All", "Pending", "Accepted", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2 text-sm font-medium transition ${
              filterStatus === status
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700 hover:bg-yellow-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Donations */}
      <div className="space-y-5">
        {filteredDonations.length > 0 ? (
          filteredDonations.map((donation) => {
            const imageUrl = donation.photos?.[0]
              ? `${BASE_URL}${donation.photos[0]}`
              : "/placeholder.jpg";

            return (
              <div
                key={donation._id}
                className="border border-yellow-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 bg-white shadow-sm"
              >
                {/* Image */}
                <div className="relative w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt={donation.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                    {donation.category}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{donation.title}</h3>
                  <p className="text-sm text-gray-500">by {donation.donor?.user_name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{donation.donor?.user_email}</p>
                  <p className="text-sm text-gray-700 mt-1">{donation.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span>📦 {donation.quantity}</span>
                    <span>📍 {donation.pickup_location}</span>
                    <span>⏰ {new Date(donation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {statusMap[donation.status] === "Pending" && (
                    <button
                      onClick={() => handleAcceptPickup(donation._id)}
                      disabled={user?.role === "ngo" && !user?.verified}
                      className={`px-4 py-2 rounded-md text-white ${
                        user?.role === "ngo" && !user?.verified
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                      title={
                        user?.role === "ngo" && !user?.verified
                          ? "Your NGO is pending verification."
                          : "Accept this donation"
                      }
                    >
                      Accept Pickup
                    </button>
                  )}

                  {/* WhatsApp Button */}
                  {donation.donor?.user_phone && (
                    <button
                      onClick={() =>
                        openWhatsApp(
                          donation.donor.user_phone,
                          donation.donor.user_name,
                          donation.title
                        )
                      }
                      className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      <MessageCircle size={16} /> WhatsApp Donor
                    </button>
                  )}

                  {/* Call */}
                  {donation.donor?.user_phone && (
                    <button
                      onClick={() => openCall(donation.donor.user_phone)}
                      className="border border-yellow-400 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-50"
                    >
                      📞 Call Donor
                    </button>
                  )}

                  {/* Directions */}
                  <button
                    onClick={() => openDirections(donation.pickup_location)}
                    className="border border-yellow-400 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-50"
                  >
                    📍 Get Directions
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No donations found.</p>
        )}
      </div>
    </div>
  );
};

export default BrowseDonations;
