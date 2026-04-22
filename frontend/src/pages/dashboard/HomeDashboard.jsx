import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { AlertTriangle, Heart } from "lucide-react";
import DonationCard from "../../components/DonationCard";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const HomeDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    activeDonations: 0,
    urgent: 0,
    canServe: 0,
    activeDonors: 0,
    totalMoney: 45000,
  });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/donations");
        setDonations(data);

        const active = data.filter(d => d.status === "available").length;
        const urgent = data.filter(d => d.urgent).length;
        const people = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
        const donors = new Set(data.map(d => d.donor?.donor_id)).size;

        setStats(prev => ({
          ...prev,
          activeDonations: active,
          urgent,
          canServe: people,
          activeDonors: donors,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      }
    };
    load();
  }, []);

  // 🔍 Filter + Search
  const filteredDonations = donations.filter(d => {
    const matchCategory = filter === "All" || d.category === filter;
    const matchSearch =
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleDonateMoney = () => {
    toast.success("Thank you! Money donation feature coming soon.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <h1 className="text-2xl font-bold break-words">Home Dashboard</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search donations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full sm:w-64 focus:outline-none"
          />

          <select
            className="px-3 py-2 border rounded-lg w-full sm:w-48"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Clothes">Clothes</option>
            <option value="Educational">Educational</option>
            <option value="Medical">Medical</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold">{stats.activeDonations}</p>
          <p className="text-sm text-gray-600">Active Donations</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-red-600">{stats.urgent}</p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <AlertTriangle size={14} /> Urgent
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-green-600">{stats.canServe}+</p>
          <p className="text-sm text-gray-600">Can Serve</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold">{stats.activeDonors}</p>
          <p className="text-sm text-gray-600">Donors</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xl font-bold text-purple-600">₹{stats.totalMoney}</p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Heart size={14} /> Funds
          </p>
        </div>
      </div>

      {/* Emotional Section */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-5 md:p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full overflow-hidden">
        <div className="max-w-full">
          <h2 className="text-lg md:text-xl font-bold text-pink-700 break-words">
            Support Beyond Items
          </h2>
          <p className="text-gray-700 text-sm md:text-base break-words">
            Help us serve more by donating money. Your contribution helps people in need.
          </p>
        </div>

        <button
          onClick={handleDonateMoney}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700 w-full md:w-auto"
        >
          Donate Money
        </button>
      </div>

      {/* Donations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
        {filteredDonations.length === 0 ? (
          <p className="text-gray-500">No donations found</p>
        ) : (
          filteredDonations.map(d => (
            <div key={d._id} className="w-full min-w-0">
              <DonationCard donation={d} showActions={false} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;