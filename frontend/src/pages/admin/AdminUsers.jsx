import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Trash2, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        await API.put(`/admin/users/${id}/block`);
        toast.success("User blocked");
      } else if (action === "unblock") {
        await API.put(`/admin/users/${id}/unblock`);
        toast.success("User unblocked");
      } else if (action === "delete") {
        await API.delete(`/admin/users/${id}`);
        toast.success("User deleted");
      }
      loadUsers(); // reload list
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    {u.status === "active" ? (
                      <button
                        onClick={() => handleAction(u._id, "block")}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Block user"
                      >
                        <Lock size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(u._id, "unblock")}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Unblock user"
                      >
                        <Unlock size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(u._id, "delete")}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
