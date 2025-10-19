// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [loading, setLoading] = useState(true);

  // 🧠 Load from localStorage on app start
  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAuth({ user: parsed.user || null, token: parsed.token || null });
      } catch (err) {
        console.error("Auth parse error:", err);
      }
    }
    setLoading(false);
  }, []);

  // 🧩 Fetch user profile (to get NGO verified status)
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.token) return;
      try {
        const { data } = await API.get("/users/me");
        if (data.user?.role === "ngo") {
          // ✅ Merge NGO verification into user
          const verified = data.profile?.verified ?? false;
          const updatedUser = { ...data.user, verified };
          setAuth((prev) => {
            const next = { ...prev, user: updatedUser };
            localStorage.setItem("auth", JSON.stringify(next));
            return next;
          });
        } else {
          // Normal user (donor/admin)
          setAuth((prev) => {
            const next = { ...prev, user: data.user };
            localStorage.setItem("auth", JSON.stringify(next));
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err.message);
      }
    };

    loadProfile();
  }, [auth?.token]);

  // 🔐 Login function
  const login = ({ user, token }) => {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  // 🚪 Logout function
  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  // 🧭 Update user (e.g., after profile edit)
  const setUser = (user) => {
    const next = { ...auth, user };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  if (loading) return null; // prevent early render before auth loads

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
