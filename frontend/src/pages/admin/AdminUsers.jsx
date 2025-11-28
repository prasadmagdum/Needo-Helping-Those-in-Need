import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Trash2, Lock, Unlock, Search } from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Load users error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "block") {
        await API.put(`/admin/users/${id}/block`, { blocked: true });
        toast.success("User blocked");
      } else if (action === "unblock") {
        await API.put(`/admin/users/${id}/block`, { blocked: false });
        toast.success("User unblocked");
      } else if (action === "delete") {
        await API.delete(`/admin/users/${id}`);
        toast.success("User deleted");
      }
      loadUsers();
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-gray-500 text-sm">
              View, block, or remove platform users
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
            No users found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role & Status */}
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "ngo"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.blocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.blocked ? "Blocked" : "Active"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-5">
                  {user.blocked ? (
                    <button
                      onClick={() => handleAction(user._id, "unblock")}
                      className="flex items-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                    >
                      <Unlock size={16} /> Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(user._id, "block")}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <Lock size={16} /> Block
                    </button>
                  )}

                  <button
                    onClick={() => handleAction(user._id, "delete")}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;
