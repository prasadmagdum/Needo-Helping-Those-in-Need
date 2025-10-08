// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Users, Building2, CheckCircle2, Gift, Activity, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout"; // ✅ Use common layout

const StatCard = ({ label, value, icon: Icon, color = "text-green-600" }) => (
  <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition">
    <div className={`p-3 rounded-full bg-green-50 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-2xl font-bold">{value ?? 0}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Admin stats load error:", err?.response?.data || err.message);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Administrator</span>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-green-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} />
            <StatCard label="Total NGOs" value={stats?.totalNGOs} icon={Building2} />
            <StatCard label="Verified NGOs" value={stats?.verifiedNGOs} icon={CheckCircle2} />
            <StatCard label="Total Donations" value={stats?.totalDonations} icon={Gift} />
            <StatCard label="Active Donations" value={stats?.activeDonations} icon={Activity} />
            <StatCard label="Completed Donations" value={stats?.completedDonations} icon={ClipboardList} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/users" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Manage Users
            </Link>
            <Link to="/admin/ngos" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Verify NGOs
            </Link>
            <Link to="/admin/donations" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Manage Donations
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-sm text-gray-500">Recent user signups, NGO requests, and donation updates will appear here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
