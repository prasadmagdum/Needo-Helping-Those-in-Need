import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Users, Building2, Gift, LayoutDashboard, PlusCircle, List, UserCircle } from "lucide-react";

const Item = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isActive
          ? "bg-green-600 text-white"
          : "text-gray-700 hover:bg-green-100"
      }`
    }
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </NavLink>
);

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r p-4 hidden md:block">
      <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
        Navigation
      </div>

      {/* 🔹 Common Home Dashboard link for all roles */}
      <nav className="space-y-2 mb-6">
        <Item to="/home" icon={Home}>Home Dashboard</Item>
      </nav>

      {/* Donor Section */}
      {user.role === "donor" && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 px-2 mb-2">Donor Panel</h2>
          <nav className="space-y-2">
            <Item to="/dashboard" icon={LayoutDashboard}>Dashboard</Item>
            <Item to="/donor/create" icon={PlusCircle}>Create Donation</Item>
            <Item to="/donor/my" icon={List}>My Donations</Item>
            <Item to="/profile/donor" icon={UserCircle}>My Profile</Item>
          </nav>
        </div>
      )}

      {/* NGO Section */}
      {user.role === "ngo" && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 px-2 mb-2">NGO Panel</h2>
          <nav className="space-y-2">
            <Item to="/dashboard" icon={LayoutDashboard}>Dashboard</Item>
            <Item to="/ngo/browse" icon={Gift}>Browse Donations</Item>
            <Item to="/ngo/my" icon={List}>My Accepted</Item>
            <Item to="/profile/ngo" icon={Building2}>Organization Profile</Item>
          </nav>
        </div>
      )}

      {/* Admin Section */}
      {user.role === "admin" && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 px-2 mb-2">Admin Panel</h2>
          <nav className="space-y-2">
            <Item to="/admin/dashboard" icon={LayoutDashboard}>Admin Dashboard</Item>
            <Item to="/admin/users" icon={Users}>User Management</Item>
            <Item to="/admin/ngos" icon={Building2}>NGO Verification</Item>
            <Item to="/admin/donations" icon={Gift}>Donation Management</Item>
          </nav>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
