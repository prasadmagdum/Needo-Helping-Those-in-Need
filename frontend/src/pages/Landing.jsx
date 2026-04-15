import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { isAdmin, isDonor, isNGO } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totals: { donations: 0, ngos: 0, lives: 0, cities: 0 },
    trends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) navigate("/admin/dashboard");
    else if (isDonor) navigate("/donor/dashboard");
    else if (isNGO) navigate("/ngo/dashboard");
  }, [isAdmin, isDonor, isNGO, navigate]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const base =
          import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";
        const { data } = await API.get(`${base}/stats`);

        const totals = data.totals ?? {
          donations: data.donations ?? 0,
          ngos: data.ngos ?? 0,
          lives: data.lives ?? 0,
          cities: data.cities ?? 0,
        };

        const donationsTrend = data.trends?.donations ?? [];
        const livesTrend = data.trends?.lives ?? [];

        const merged = {};
        donationsTrend.forEach((d) => {
          if (!d?._id) return;
          const key = `${d._id.year}-W${d._id.week}`;
          merged[key] = { week: key, donations: d.count ?? 0, lives: 0 };
        });

        livesTrend.forEach((l) => {
          if (!l?._id) return;
          const key = `${l._id.year}-W${l._id.week}`;
          if (!merged[key])
            merged[key] = { week: key, donations: 0, lives: l.count ?? 0 };
          else merged[key].lives = l.count ?? 0;
        });

        setStats({
          totals,
          trends: Object.values(merged).sort((a, b) =>
            a.week.localeCompare(b.week)
          ),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="bg-gray-50">
      <Navbar />

      {/* HERO */}
      <header className="bg-gradient-to-r from-sky-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Share Surplus, <br />
              <span className="text-yellow-300">Change Lives</span>
            </h1>
            <p className="mt-4 text-gray-100 max-w-md mx-auto md:mx-0">
              Turn your surplus food, clothes, or books into hope for communities in need.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/donor/create"
                className="bg-white text-sky-700 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-100"
              >
                Start Donating
              </Link>
              <Link
                to="/register?role=ngo"
                className="bg-green-500 px-6 py-3 rounded-xl font-semibold hover:bg-green-600"
              >
                Join as NGO
              </Link>
            </div>

            <p className="mt-3 text-sm text-gray-200">
              ✓ Verified NGOs • Secure Donations • Real Impact
            </p>
          </div>

          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d"
              alt="donation"
              className="rounded-2xl shadow-lg w-full h-72 object-cover"
            />
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Create Donation",
              desc: "Post your surplus items easily from your phone.",
              img: "https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9uYXRpb258ZW58MHx8MHx8fDA%3D",
            },
            {
              title: "NGO Matches",
              desc: "Verified NGOs accept donations that meet their needs.",
              img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUd38mY4INWoOmg_6l5U337Tkof7UzuS396Q&s",
            },
            {
              title: "Make Impact",
              desc: "Coordinate pickups or drop-offs and change lives.",
              img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY5g7ZYSuR2HgNhlgqOR1_kF34FAXK6_oi5g&s",
            },
          ].map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow hover:shadow-lg">
              <img
                src={step.img}
                alt={step.title}
                className="h-52 w-full object-cover rounded-t-xl"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-gray-600 mt-2">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-100 py-16 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">Our Global Impact</h2>

          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {[
                  ["Donations", stats.totals.donations],
                  ["NGOs", stats.totals.ngos],
                  ["Lives", stats.totals.lives],
                  ["Cities", stats.totals.cities],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-sky-600">
                      {val.toLocaleString()}
                    </p>
                    <p className="text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="donations" stroke="#0ea5e9" />
                    <Line dataKey="lives" stroke="#f97316" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-12">Success Stories</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "500+ Meals Shared",
              desc: "Donors helped feed families in urban areas.",
              img: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b",
            },
            {
              title: "1200+ Books Donated",
              desc: "NGOs distributed books to children.",
              img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
            },
          ].map((story, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow hover:shadow-lg">
              <img
                src={story.img}
                alt={story.title}
                className="h-56 w-full object-cover rounded-t-xl"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg">{story.title}</h3>
                <p className="text-gray-600 mt-2">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/stories"
          className="inline-block mt-8 text-sky-600 font-semibold hover:underline"
        >
          View More Stories →
        </Link>
      </section>

      {/* FOOTER (PERFECT CENTER) */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-6">
          
          <div>
            <h3 className="text-white text-xl font-bold">
              Needo
            </h3>
            <p className="text-sm mt-2 max-w-md">
              Connecting donors with NGOs to reduce waste and create real change.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/about" className="hover:text-white">How it Works</Link>
            <Link to="/donors" className="hover:text-white">Donors</Link>
            <Link to="/ngos" className="hover:text-white">NGOs</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Needo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;