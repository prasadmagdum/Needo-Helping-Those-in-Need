import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const NGODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState({
    total: 0,
    delivered: 0,
    lives: 0,
    successRate: 0,
  });
  const [active, setActive] = useState([]);
  const [available, setAvailable] = useState([]);
  const [recent, setRecent] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { width, height } = useWindowSize();
  const MILESTONE = 10;
  const CELEBRATION_THRESHOLD = 5;

  // Load profile for verification
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.role !== "ngo") return;
        const { data } = await API.get("/users/me");
        setProfile(data.profile || null);
      } catch {
        console.warn("Failed to load NGO profile status");
      }
    };
    loadProfile();
  }, [user]);

  // Load Dashboard Data
  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== "ngo") {
          setLoading(false);
          return;
        }

        const { data: accepted = [] } = await API.get("/accept/my");
        const { data: availableDonations = [] } = await API.get("/donations?excludeMine=true");

        const total = accepted?.length || 0;
        const delivered = accepted?.filter((a) => a.status === "delivered")?.length || 0;
        const lives =
          accepted?.reduce(
            (sum, a) => sum + (a?.donation?.quantity ? Number(a.donation.quantity) : 1),
            0
          ) || 0;
        const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

        setImpact({ total, delivered, lives, successRate });
        setActive(accepted?.filter((a) => a.status !== "delivered") || []);
        setAvailable(availableDonations?.filter((d) => d.status === "available") || []);
        setRecent(
          [...(accepted || [])]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3)
        );

        if (delivered >= CELEBRATION_THRESHOLD) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } catch (err) {
        console.error("NGO Dashboard error:", err);
        toast.error("Failed to load NGO dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading)
    return (
      <p className="flex items-center gap-2 p-6 text-gray-600">
        <Loader2 className="animate-spin" /> Loading dashboard...
      </p>
    );

  //  Verification Badge
  const verificationStatus =
    profile?.status || (profile?.verified ? "verified" : "pending");
  const statusColor =
    verificationStatus === "verified"
      ? "bg-green-50 text-green-700"
      : verificationStatus === "rejected"
      ? "bg-red-50 text-red-700"
      : "bg-yellow-50 text-yellow-700";
  const statusLabel =
    verificationStatus === "verified"
      ? "✅Verified NGO"
      : verificationStatus === "rejected"
      ? "❌ Rejected NGO"
      : "⏳ Pending Verification";

  const progressPercent = Math.min(Math.round((impact.delivered / MILESTONE) * 100), 100);

  const StatCard = ({ colorClass, value, label }) => (
    <div className="bg-white p-5 rounded-xl shadow transform hover:-translate-y-1 transition">
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto relative">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        <div
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColor}`}
        >
          {statusLabel}
        </div>
      </div>

      {/*  Impact Gradient Card */}
      <div
        className="rounded-2xl p-6 shadow-lg overflow-hidden"
        style={{
          background: "linear-gradient(90deg,#e8f8f5,#f0f7ff)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              You’re changing lives every day 
            </h2>
            <p className="text-gray-700 mt-1">
              You’ve handled <strong>{impact.total}</strong> donations and supported{" "}
              <strong>{impact.lives}</strong> people. Keep up the amazing work!
            </p>
          </div>

          <div className="flex items-center gap-6 mt-3 md:mt-0">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-700">{impact.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-sky-600">{impact.successRate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard colorClass="text-sky-600" value={impact.total} label="Accepted" />
        <StatCard colorClass="text-green-600" value={impact.delivered} label="Delivered" />
        <StatCard colorClass="text-orange-500" value={impact.lives} label="Lives Helped" />
        <StatCard
          colorClass="text-purple-600"
          value={`${impact.successRate}%`}
          label="Success Rate"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-sm text-gray-700 mb-1">Progress to next milestone</p>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-green-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {impact.delivered}/{MILESTONE} deliveries
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/ngo/browse"
          className="p-6 rounded-xl shadow transform hover:-translate-y-1 transition flex items-center justify-center bg-gradient-to-r from-green-500 to-sky-500 text-white font-semibold"
        >
           Browse Donations
        </Link>

        <Link
          to="/ngo/my"
          className="p-6 rounded-xl shadow transform hover:-translate-y-1 transition flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-400 text-white font-semibold"
        >
          My Accepted
        </Link>
      </div>

      {/* Available Nearby → Browse Donations */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Available Nearby</h2>
          <button
            onClick={() => navigate("/ngo/browse")}
            className="text-sm text-sky-600 hover:underline"
          >
            View All →
          </button>
        </div>

        {available.length === 0 ? (
          <p className="text-gray-500">No available donations nearby</p>
        ) : (
          <div className="space-y-3">
            {available.slice(0, 3).map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-sm text-gray-500">{d.category}</p>
                </div>
                <button
                  onClick={() => navigate("/ngo/browse")}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*  Active Requests → My Accepted */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Active Requests</h2>
          <button
            onClick={() => navigate("/ngo/my")}
            className="text-sm text-sky-600 hover:underline"
          >
            Manage All →
          </button>
        </div>

        {active.length === 0 ? (
          <p className="text-gray-500">No active requests</p>
        ) : (
          <div className="space-y-3">
            {active.slice(0, 3).map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{a?.donation?.title || "Untitled Donation"}</p>
                  <p className="text-sm text-gray-500">
                    Status: {a?.status?.replace("_", " ") || "unknown"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/ngo/my")}
                  className="text-sky-600 font-medium hover:underline"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*  Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    Donation received from {a?.donor?.user_name || "Donor"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {a?.donation?.title || "Untitled"} • {a?.status || "unknown"}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {a?.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
