import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const DonorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    donations: 0,
    livesHelped: 0,
    score: 0,
    completed: 0,
  });
  const [recent, setRecent] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== "donor") {
          setLoading(false);
          return;
        }

        const { data: myDonations } = await API.get("/donations/my");
        const { data: details } = await API.get("/donations/my/details");
        const { data: urgentDonations } = await API.get("/donations?excludeMine=true");

        const completed =
          details?.donations?.filter((d) => d.status === "completed")?.length || 0;
        const livesHelped = details?.accepts?.length || 0;
        const score = (myDonations?.length || 0) * 50;

        setStats({
          donations: myDonations?.length || 0,
          livesHelped,
          score,
          completed,
        });

        setRecent(myDonations?.slice(-3).reverse() || []);
        setUrgent(urgentDonations?.filter((d) => d.urgent) || []);

        if (myDonations?.length >= 5) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } catch (err) {
        console.error("Dashboard error:", err.response?.data || err.message);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading)
    return (
      <p className="flex items-center justify-center py-10 text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading your dashboard...
      </p>
    );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto relative overflow-x-hidden">
      
      {/* Confetti Fix */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          <Confetti width={width} height={height} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
        <div className="max-w-full">
          <h1 className="text-3xl font-bold text-gray-800 break-words">
            Welcome back, {user?.name || "Donor"}
          </h1>
          <p className="text-gray-600 break-words">
            Thank you for making a difference every single day
          </p>
        </div>

        <Link
          to="/profile/donor"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shrink-0"
        >
          View Profile
        </Link>
      </div>

      {/* Motivation */}
      {stats.donations > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between w-full overflow-hidden">
          <div className="max-w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 break-words">
              You’re spreading kindness!
            </h2>
            <p className="text-gray-700 break-words">
              You’ve made <strong>{stats.donations}</strong> donations and helped{" "}
              <strong>{stats.livesHelped}</strong> lives.
            </p>
          </div>

          <div className="text-center mt-4 md:mt-0 shrink-0">
            <p className="text-3xl font-bold text-green-700">{stats.score}</p>
            <p className="text-gray-600 text-sm">Impact Score</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-green-600">{stats.donations}</p>
          <p className="text-gray-600 text-sm">Total Donations</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-orange-500">{stats.completed}</p>
          <p className="text-gray-600 text-sm">Completed</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-sky-500">{stats.livesHelped}</p>
          <p className="text-gray-600 text-sm">Lives Helped</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.score}</p>
          <p className="text-gray-600 text-sm">Impact Score</p>
        </div>
      </div>

      {/* Progress */}
      {stats.completed > 0 && (
        <div className="bg-white p-4 rounded-xl shadow w-full">
          <p className="text-sm text-gray-700 mb-1">
            Progress to next level
          </p>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-3 bg-green-500 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((stats.completed / 10) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completed}/10 completed donations
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4 w-full">
        <Link
          to="/donor/create"
          className="bg-green-600 text-white p-6 rounded-xl shadow hover:bg-green-700 text-center font-medium"
        >
          Create New Donation
        </Link>

        <Link
          to="/donor/my"
          className="bg-indigo-600 text-white p-6 rounded-xl shadow hover:bg-indigo-700 text-center font-medium"
        >
          View My Donations
        </Link>
      </div>

      {/* Recent */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-3">Recent Donations</h2>

        {recent.length === 0 ? (
          <p className="text-gray-500">No recent donations found</p>
        ) : (
          <div className="space-y-3">
            {recent.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center gap-3 w-full"
              >
                <div className="min-w-0">
                  <p className="font-semibold break-words">{d.title}</p>
                  <p className="text-sm text-gray-500 break-words">
                    {d.category}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium shrink-0 bg-gray-100 text-gray-700">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Urgent */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-3 text-red-600">
          Urgent Requests Nearby
        </h2>

        {urgent.length === 0 ? (
          <p className="text-gray-500">No urgent requests</p>
        ) : (
          <div className="space-y-4">
            {urgent.map((u) => (
              <div
                key={u._id}
                className="border border-red-200 bg-red-50 rounded-xl p-4 flex justify-between items-center gap-3 w-full"
              >
                <div className="min-w-0">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    URGENT
                  </span>

                  <h3 className="font-bold mt-1 break-words">
                    {u.title}
                  </h3>

                  <p className="text-sm text-gray-600 break-words">
                    {u.description || "No details"}
                  </p>
                </div>

                <Link
                  to={`/donations/${u._id}`}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shrink-0"
                >
                  Help Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;