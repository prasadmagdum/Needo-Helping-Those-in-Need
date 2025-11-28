import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, RefreshCw, CheckCircle, Clock, XCircle, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const DonationDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all donation details
  const loadDonations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/donations/my/details");
      setData(data);
    } catch {
      toast.error("⚠️ Failed to load donation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  // Get status badge styles
  const statusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Accepted: "bg-green-100 text-green-700 border-green-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
      Completed: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-sky-600 mr-2" />
        <span className="text-gray-600">Loading donation details...</span>
      </div>
    );
  }

  if (!data || (!data.donations?.length && !data.accepts?.length)) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">You haven’t made any donations yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-sky-600 flex items-center gap-2">
          📊 Donation Details
        </h1>
        <button
          onClick={loadDonations}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Your Donations Section */}
      <h2 className="text-xl font-semibold mb-4">🧺 Your Donations</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {data.donations.map((donation) => (
          <div
            key={donation._id}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50"
          >
            {donation.image && (
              <img
                src={`/uploads/donations/${donation.image}`}
                alt={donation.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <h3 className="text-lg font-bold text-gray-800">{donation.title}</h3>
            <p className="text-gray-600 text-sm">{donation.description || "No description"}</p>

            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              <p><strong>Category:</strong> {donation.category || "N/A"}</p>
              <p><strong>Quantity:</strong> {donation.quantity || "1"}</p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full border text-sm font-medium ${statusBadge(
                  donation.status
                )}`}
              >
                {donation.status}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(donation.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NGO Acceptances Section */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-sky-600" /> Accepted by NGOs
      </h2>
      {data.accepts.length ? (
        <div className="space-y-4">
          {data.accepts.map((a) => (
            <div
              key={a._id}
              className="border rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800">
                  {a.ngo_id.ngo_name} ({a.ngo_id.registration_no})
                </p>
                <span
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${statusBadge(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                <strong>Donation:</strong> {a.donation_id?.title || "N/A"}
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Accepted On:</strong>{" "}
                {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No NGOs have accepted your donations yet.</p>
      )}
    </div>
  );
};

export default DonationDetails;
