import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-4xl font-bold text-green-600">
            Needo
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <Link
                to="/home"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Home Dashboard
              </Link>
            )}

            {/* Admin Links */}
            {user?.role === "admin" && (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-green-600 font-medium">
                  Admin Dashboard
                </Link>
                <Link to="/admin/users" className="text-gray-700 hover:text-green-600 font-medium">
                  Users
                </Link>
                <Link to="/admin/ngos" className="text-gray-700 hover:text-green-600 font-medium">
                  NGOs
                </Link>
                <Link to="/admin/donations" className="text-gray-700 hover:text-green-600 font-medium">
                  Donations
                </Link>
              </>
            )}

            {/* Donor/NGO Links */}
            {user && user.role !== "admin" && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-green-600 font-medium">
                  Profile
                </Link>
              </>
            )}

            {/* Role Label */}
            {user && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                {user.role.toUpperCase()}
              </span>
            )}

            {/* Auth Buttons */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Login
                </Link>

                {/* Register Dropdown */}
                <div className="relative group">
                  <button className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50">
                    Register ▾
                  </button>
                  <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 w-40">
                    <Link
                      to="/register?role=donor"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Donor
                    </Link>
                    <Link
                      to="/register?role=ngo"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      NGO
                    </Link>
                    {/* Optional: expose Admin only if you want self-registration */}
                    {/* 
                    <Link
                      to="/register?role=admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Admin
                    </Link>
                    */}
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow">
          <div className="flex flex-col px-4 py-3 space-y-2">
            {user && (
              <Link
                to="/home"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-green-600"
              >
                Home Dashboard
              </Link>
            )}

            {/* Admin Links (Mobile) */}
            {user?.role === "admin" && (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  Admin Dashboard
                </Link>
                <Link to="/admin/users" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  Users
                </Link>
                <Link to="/admin/ngos" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  NGOs
                </Link>
                <Link to="/admin/donations" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  Donations
                </Link>
              </>
            )}

            {/* Donor/NGO Links (Mobile) */}
            {user && user.role !== "admin" && (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-green-600">
                  Profile
                </Link>
              </>
            )}

            {/* Role Label (Mobile) */}
            {user && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 w-fit">
                {user.role.toUpperCase()}
              </span>
            )}

            {/* Auth Buttons */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Login
                </Link>

                {/* Mobile Register Dropdown */}
                <div className="relative">
                  <button className="w-full px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50">
                    Register ▾
                  </button>
                  <div className="bg-white shadow-lg rounded-lg mt-1 w-full">
                    <Link
                      to="/register?role=donor"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      Donor
                    </Link>
                    <Link
                      to="/register?role=ngo"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      NGO
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
