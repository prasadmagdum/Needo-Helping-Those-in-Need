import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Loader2, Search, CheckCircle2, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";

/** Status badge with color coding */
const StatusBadge = ({ status }) => {
  const styles = {
    verified: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };
  const labels = {
    verified: "Verified ✅",
    pending: "Pending ⏳",
    rejected: "Rejected ❌",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
};

const AdminNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | verified | rejected

  // ✅ Base URL for backend file access
  const BASE_URL = "http://localhost:5000";

  /** Load NGOs from backend */
  const loadNgos = async () => {
    try {
      let url = "/admin/ngos";
      if (filter !== "all") url += `?status=${filter}`;
      const { data } = await API.get(url);
      setNgos(data);
    } catch (err) {
      console.error("Error loading NGOs:", err?.response?.data || err.message);
      toast.error("Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  };

  /** Verify NGO */
  const verifyNgo = async (id) => {
    try {
      await API.put(`/admin/ngos/${id}/verify`);
      toast.success("✅ NGO verified successfully");
      loadNgos();
    } catch {
      toast.error("Failed to verify NGO");
    }
  };

  /** Reject NGO */
  const rejectNgo = async (id) => {
    if (!window.confirm("Are you sure you want to reject this NGO?")) return;
    try {
      await API.delete(`/admin/ngos/${id}/reject`);
      toast.success("❌ NGO rejected");
      loadNgos();
    } catch {
      toast.error("Failed to reject NGO");
    }
  };

  useEffect(() => {
    loadNgos();
  }, [filter]);

  /** Search filter */
  const filteredNgos = ngos.filter(
    (n) =>
      n.ngo_name?.toLowerCase().includes(search.toLowerCase()) ||
      n.registration_no?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">NGO Verification</h1>
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search NGOs..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter */}
          <select
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-green-600" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="px-4 py-2">NGO Name</th>
                <th className="px-4 py-2">Reg. No</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Certificate</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNgos.length > 0 ? (
                filteredNgos.map((ngo) => {
                  // 🧩 Ensure certificate URL works correctly
                  const certUrl = ngo.certificateUrl
                    ? ngo.certificateUrl.startsWith("http")
                      ? ngo.certificateUrl
                      : `${BASE_URL}${ngo.certificateUrl}`
                    : null;

                  return (
                    <tr key={ngo._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{ngo.ngo_name}</td>
                      <td className="px-4 py-2">{ngo.registration_no}</td>
                      <td className="px-4 py-2">
                        {ngo.user_id?.name}
                        <br />
                        <span className="text-gray-500 text-xs">
                          {ngo.user_id?.email}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge
                          status={ngo.status || (ngo.verified ? "verified" : "pending")}
                        />
                      </td>
                      <td className="px-4 py-2">
                        {certUrl ? (
                          <a
                            href={certUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        {ngo.status === "pending" && (
                          <>
                            <button
                              onClick={() => verifyNgo(ngo._id)}
                              className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              <CheckCircle2 className="inline w-4 h-4 mr-1" /> Verify
                            </button>
                            <button
                              onClick={() => rejectNgo(ngo._id)}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              <XCircle className="inline w-4 h-4 mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {ngo.status === "verified" && (
                          <span className="text-green-700 text-xs">✅ Verified</span>
                        )}
                        {ngo.status === "rejected" && (
                          <span className="text-red-700 text-xs">❌ Rejected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No NGOs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNGOs;
