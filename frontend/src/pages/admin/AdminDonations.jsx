import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Loader2,
  Search,
  Trash2,
  Gift,
  User,
  Mail,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

const StatusBadge = ({ status }) => {
  const styles = {
    available: "bg-yellow-100 text-yellow-700",
    claimed: "bg-blue-100 text-blue-700",
    pending_pickup: "bg-orange-100 text-orange-700",
    in_transit: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all"); // ✅ new filter

  const BASE_URL = "http://localhost:5000"; // adjust if needed

  const loadDonations = async () => {
    try {
      const { data } = await API.get("/admin/donations");
      setDonations(data);
    } catch (err) {
      console.error("Error loading donations:", err);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await API.delete(`/admin/donations/${id}`);
      toast.success("Donation deleted");
      loadDonations();
    } catch {
      toast.error("Failed to delete donation");
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  // ✅ Filtering logic (search + status + category)
  const filteredDonations = donations.filter((d) => {
    const matchesStatus =
      statusFilter === "all" || d.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      d.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_email?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-8 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Donations</h1>
            <p className="text-gray-500 text-sm">
              View and manage all donations submitted by donors
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donations..."
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="food">Food</option>
                <option value="clothes">Clothes</option>
                <option value="education">Education</option>
                <option value="other">Others</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="pending_pickup">Pending Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Donation Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
            No donations found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonations.map((donation) => {
              const photo =
                donation.photos && donation.photos.length > 0
                  ? `${BASE_URL}${donation.photos[0]}`
                  : null;

              return (
                <div
                  key={donation._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Preview */}
                  <div className="mb-3 w-full flex justify-center">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Donation"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Donation Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-800 text-lg truncate">
                        {donation.title || "Unnamed Donation"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Category:{" "}
                        <span className="font-medium capitalize">
                          {donation.category || "Other"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {donation.quantity || 1}
                      </p>
                    </div>
                    <StatusBadge status={donation.status} />
                  </div>

                  {/* Donor Info */}
                  <div className="mt-3 text-sm text-gray-600">
                    {donation.donor?.user_name && (
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {donation.donor.user_name}
                      </p>
                    )}
                    {donation.donor?.user_email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {donation.donor.user_email}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => deleteDonation(donation._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDonations;
