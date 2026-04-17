import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Loader2 } from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { isAdmin, isDonor, isNGO } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totals: { donations: 0, ngos: 0, lives: 0, cities: 0 },
  });
  const [loading, setLoading] = useState(true);
  //  SLIDER DATA
const images = [
  "https://assets.thehansindia.com/h-upload/2023/08/09/1371274-robin-hood-army.webp",
  "https://images.unsplash.com/photo-1593113630400-ea4288922497",
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
  
];


const [current, setCurrent] = useState(0);

// AUTO SLIDE EFFECT
useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, 3000);

  return () => clearInterval(interval);
}, []);

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

        setStats({
          totals: data.totals ?? {
            donations: data.donations ?? 0,
            ngos: data.ngos ?? 0,
            lives: data.lives ?? 0,
            cities: data.cities ?? 0,
          },
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
      <div className="bg-gradient-to-b from-[#e6f7f5] to-white scroll-smooth">
        <Navbar />

      {/* HERO */}
      <header className="relative min-h-screen flex items-center justify-center text-white">

        {/*  BACKGROUND IMAGE SLIDER */}
        <div className="absolute inset-0">
          <img
            src={images[current]}
            alt="background"
            className="w-full h-full object-cover transition-all duration-1000"
          />
        </div>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/*CENTER CONTENT */}
        <div className="relative z-10 text-center px-6 max-w-3xl">

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Share Surplus, <br />
            <span className="text-yellow-300">Change Lives</span>
          </h1>

          <p className="mt-5 text-gray-200 text-lg">
            Turn your extra food, clothes, or books into hope for communities in need.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              to="/donor/create"
              className="border border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
            >
              Start Donating
            </Link>

            <Link
              to="/register?role=ngo"
              className="border border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
            >
              Join as NGO
            </Link>

          </div>

          <p className="mt-4 text-sm text-gray-300">
            ✓ Verified NGOs • Secure Donations • Real Impact
          </p>

        </div>

      </header>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-center 
               bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 
               text-transparent bg-clip-text relative inline-block">How It Works</h2>

          {/* CARDS */}
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Create Donation",
                desc: "Post your surplus items easily from your phone.",
                img: "https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?auto=format&fit=crop&w=1000&q=60",
              },
              {
                title: "NGO Matches",
                desc: "Verified NGOs accept donations that meet their needs.",
                img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
              },
              {
                title: "Make Impact",
                desc: "Coordinate pickup or delivery and help instantly.",
                img: "https://images.unsplash.com/photo-1593113630400-ea4288922497",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-green-50 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-green-100"
              >
                <img
                  src={step.img}
                  alt={step.title}
                  className="h-52 w-full object-cover rounded-t-xl"
                />

                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      <section className="bg-white py-24 text-center">
        <div className="max-w-7xl mx-auto px-6">

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 
                        bg-gradient-to-r from-green-500 to-emerald-400 
                        text-transparent bg-clip-text inline-block">
                        You Can Do with Needo
          </h2>

          {/* FEATURES GRID */}
          <div className="grid md:grid-cols-3 gap-10">

            {[
              {
                title: "Post Donations Easily",
                desc: "Share food, clothes, or essentials in just a few clicks.",
                img: "https://img.freepik.com/premium-vector/hand-places-heart-box-labeled-donation_255494-1438.jpg?semt=ais_hybrid&w=740&q=80",
              },
              {
                title: "Real-Time Tracking",
                desc: "Track your donations and see where they go.",
                img: "https://img.freepik.com/free-vector/delivery-online-shipping-services-online-order-tracking-delivery-home-office-courier-by-truck-scooter-bicycle-parcel-send-location-pins-mobile-phone-by-delivery-man_1150-58774.jpg?semt=ais_hybrid&w=740&q=80",
              },
              {
                title: "Connect with NGOs",
                desc: "Directly connect with verified NGOs near you.",
                img: "https://i3.wp.com/www.thetalentedindian.com/wp-content/uploads/2020/04/RHA-1000x600.jpeg",
              },
              {
                title: "Secure Platform",
                desc: "Your data and donations are safe and verified.",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLutDl86ERTCxuzE1lgSuqufclSw7yMLZSww&s",
              },
              {
                title: "Quick Pickup",
                desc: "Schedule pickup or delivery with ease.",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkXvw-a-y-SqJyE1XcrXPnjr6t9m8MJ1Swig&s",
              },
              {
                title: "Impact Insights",
                desc: "See how your donation helps communities.",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgC1kTXUB4ScpzdbfyWR0giq9vg9Ot5AjT6w&s",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
              >

                {/* IMAGE */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-64 w-full object-cover group-hover:scale-110 transition duration-500"
                />

                {/* DARK OVERLAY */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition duration-300"></div>

                {/* CONTENT */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-left text-white">
                  <h3 className="font-semibold text-xl">
                    {item.title}
                  </h3>
                  <p className="text-sm mt-2 text-gray-200">
                    {item.desc}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-white py-24 text-center">
        <div className="max-w-7xl mx-auto px-6">

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-center 
               bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 
               text-transparent bg-clip-text relative inline-block">Our Impact</h2>

          {loading ? (
            <Loader2 className="animate-spin mx-auto text-gray-600" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                ["Donations", stats.totals.donations],
                ["NGOs", stats.totals.ngos],
                ["Lives", stats.totals.lives],
                ["Cities", stats.totals.cities],
              ].map(([label, val], i) => (
                <div
                  key={i}
                  className="bg-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition duration-300 border border-green-100"
                >
                  <p className="text-4xl md:text-5xl font-extrabold text-green-600">
                    {val.toLocaleString()}
                  </p>

                  <p className="text-gray-600 mt-3 text-sm md:text-base">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      <section className="bg-green-50 py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
            Be the Reason Someone Smiles Today
          </h2>

          {/* SUBTEXT */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Your small contribution can create a big impact. Join our mission to help communities and reduce waste.
          </p>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-gray-600 py-14 border-t">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-sm">

          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-extrabold mb-4 
                          bg-gradient-to-r from-green-500 to-emerald-400 
                          text-transparent bg-clip-text">
              Needo
            </h2>
            <p className="leading-relaxed text-gray-500">
              A platform to connect donors with NGOs and reduce waste while helping people in need.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">

              <li>
                <button
                  onClick={() =>
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-sky-600 transition"
                >
                  How It Works
                </button>
              </li>

              <li>
                <button
                  onClick={() =>
                    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-sky-600 transition"
                >
                  Donate Items
                </button>
              </li>

              <li>
                <button
                  onClick={() =>
                    document.getElementById("ngo")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-sky-600 transition"
                >
                  Join as NGO
                </button>
              </li>

            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="hover:text-sky-600 cursor-pointer">Help Center</li>
              <li className="hover:text-sky-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-sky-600 cursor-pointer">Terms & Conditions</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>📧 prasadmagdum307@gmail.com</li>
              <li>📞 8767963581</li>
            </ul>

            {/* SOCIAL */}
            <div className="flex gap-4 mt-4 text-lg text-gray-500">
              <span className="hover:text-sky-600 cursor-pointer"></span>
              <span className="hover:text-sky-600 cursor-pointer"></span>
              <span className="hover:text-sky-600 cursor-pointer"></span>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="text-center text-gray-400 text-xs mt-10">
          © {new Date().getFullYear()} Needo • Helping Those in Need, One Donation at a Time
        </div>
      </footer>
    </div>
  );
};

export default Landing;