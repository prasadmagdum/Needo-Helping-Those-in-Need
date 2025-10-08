import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDonations = async () => {
    try {
      const { data } = await API.get("/admin/donations");
      setDonations(data);
    } catch (err) {
      console.error("Error loading donations:", err?.response?.data || err.message);
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

  const filteredDonations = donations.filter(
    (d) =>
      d.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor?.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donation Management</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search donations..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-green-600" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Donor</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation._id} className="border-t">
                    <td className="px-4 py-2">{donation.item_name}</td>
                    <td className="px-4 py-2">{donation.quantity}</td>
                    <td className="px-4 py-2 capitalize">{donation.status}</td>
                    <td className="px-4 py-2">
                      {donation.donor?.user_name} <br />
                      <span className="text-xs text-gray-500">
                        {donation.donor?.user_email}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteDonation(donation._id)}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No donations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
