import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Loader2,
  MessageCircle,
  Truck,
  ClipboardCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const MyAccepted = () => {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("All");

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const load = async () => {
    try {
      const { data } = await API.get("/accept/my");
      setItems(data);
    } catch {
      toast.error("Failed to load accepted donations");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/accept/${id}/status`, { status });
      toast.success("Status updated successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Update failed");
    }
  };

  const openWhatsApp = (phone, name, title) => {
    if (!phone) return toast.error("Donor phone not available");

    const msg = `Hello ${
      name || "Donor"
    }, I'm following up regarding your donation (${title}).`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      msg
    )}`;

    window.open(url, "_blank");
  };

  useEffect(() => {
    load();
  }, []);

  if (!items) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-600 p-6">
        <Loader2 className="animate-spin" />
        Loading accepted donations...
      </div>
    );
  }

  const filteredItems =
    filter === "All"
      ? items
      : items.filter((a) => {
          if (filter === "Pending Pickup")
            return a.status === "pending_pickup";
          if (filter === "In Transit")
            return a.status === "in_transit";
          if (filter === "Delivered")
            return a.status === "delivered";
          return true;
        });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <ClipboardCheck className="text-sky-600 w-6 h-6" />
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
          My Accepted Donations
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar bg-gray-100 p-1 rounded-full w-full md:w-fit mb-6 gap-1">
        {["All", "Pending Pickup", "In Transit", "Delivered"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`whitespace-nowrap px-4 py-2 text-xs md:text-sm font-medium rounded-full transition ${
                filter === tab
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-100"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <img
            src="/empty-box.svg"
            alt="No donations"
            className="w-20 h-20 mx-auto mb-3 opacity-70"
          />
          <p className="text-sm">
            No donations found for this status.
          </p>
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((a) => {
            const donation = a.donation || {};
            const donor = a.donor || {};

            const imageUrl = donation.photos?.[0]
              ? `${BASE_URL}${donation.photos[0]}`
              : "/placeholder.jpg";

            return (
              <div
                key={a._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={donation.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                    {donation.category || "General"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {donation.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {donation.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Donor:</span>{" "}
                      {donor.user_name || "Unknown"}
                    </p>
                    <p className="truncate">
                      <span className="font-medium">Location:</span>{" "}
                      {donation.pickup_location ||
                        "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Qty:</span>{" "}
                      {donation.quantity || "N/A"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Update Status
                    </label>
                    <select
                      value={a.status}
                      onChange={(e) =>
                        updateStatus(a._id, e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400"
                    >
                      <option value="pending_pickup">
                        Pending Pickup
                      </option>
                      <option value="in_transit">
                        In Transit
                      </option>
                      <option value="delivered">
                        Delivered
                      </option>
                    </select>
                  </div>

                  {/* WhatsApp */}
                  {donor.user_phone && (
                    <button
                      onClick={() =>
                        openWhatsApp(
                          donor.user_phone,
                          donor.user_name,
                          donation.title
                        )
                      }
                      className="mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm py-2.5 rounded-lg transition"
                    >
                      <MessageCircle size={16} />
                      WhatsApp Donor
                    </button>
                  )}

                  {/* Status Info */}
                  {a.status === "in_transit" && (
                    <div className="mt-3 flex items-center gap-2 text-sky-600 text-xs font-medium">
                      <Truck size={16} />
                      In transit
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAccepted;