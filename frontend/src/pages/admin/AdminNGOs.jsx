import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    verified: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };
  const labels = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
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
  const [filter, setFilter] = useState("all");
  const BASE_URL = "http://localhost:5000";

  const loadNgos = async () => {
    try {
      let url = "/admin/ngos";
      if (filter !== "all") url += `?status=${filter}`;
      const { data } = await API.get(url);
      setNgos(data);
    } catch (err) {
      console.error("Error loading NGOs:", err);
      toast.error("Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  };

  const verifyNgo = async (id) => {
    try {
      await API.put(`/admin/ngos/${id}/verify`);
      toast.success("✅ NGO verified successfully");
      loadNgos();
    } catch {
      toast.error("Failed to verify NGO");
    }
  };

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

  const filteredNgos = ngos.filter(
    (n) =>
      n.ngo_name?.toLowerCase().includes(search.toLowerCase()) ||
      n.registration_no?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 p-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">NGO Verification</h1>
            <p className="text-gray-500 text-sm">
              Review, verify, or reject NGOs registered on the platform
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search NGOs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
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

        {/* NGO Cards Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-green-600" />
          </div>
        ) : filteredNgos.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
            No NGOs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNgos.map((ngo) => {
              const certUrl = ngo.certificateUrl
                ? ngo.certificateUrl.startsWith("http")
                  ? ngo.certificateUrl
                  : `${BASE_URL}${ngo.certificateUrl}`
                : null;

              return (
                <div
                  key={ngo._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full text-green-700">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-800 text-lg">
                          {ngo.ngo_name || "Unnamed NGO"}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Reg. No: {ngo.registration_no || "N/A"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={ngo.status || (ngo.verified ? "verified" : "pending")}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    {ngo.user_id?.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {ngo.user_id.email}
                      </p>
                    )}
                    {ngo.user_id?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {ngo.user_id.phone}
                      </p>
                    )}
                  </div>

                  {/* Certificate */}
                  <div className="mt-3">
                    {certUrl ? (
                      <a
                        href={certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-600 hover:underline text-sm"
                      >
                        <Eye className="w-4 h-4" /> View Certificate
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No Certificate</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-5">
                    {ngo.status === "pending" && (
                      <>
                        <button
                          onClick={() => verifyNgo(ngo._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
                        >
                          <CheckCircle2 size={16} /> Verify
                        </button>
                        <button
                          onClick={() => rejectNgo(ngo._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                    {ngo.status === "verified" && (
                      <span className="text-green-700 text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 size={16} /> Verified
                      </span>
                    )}
                    {ngo.status === "rejected" && (
                      <span className="text-red-700 text-sm font-medium flex items-center gap-1">
                        <XCircle size={16} /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminNGOs;
