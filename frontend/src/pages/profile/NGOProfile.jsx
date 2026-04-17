import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import { Loader2, Edit3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NGOProfile = () => {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // 🔹 Load Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        const profile = data.profile || {};

        setProfileData(profile);

        reset({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          ngo_name: profile.ngo_name || "",
          registration_no: profile.registration_no || "",
          needs_category_csv: (profile.needs_category || []).join(", "),
        });

        setUser(data.user);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 File Validation
  const handleFileChange = (file) => {
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File must be under 5MB");
      return;
    }

    setCertificate(file);
  };

  // 🔹 Submit
  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);

      const needs_category = values.needs_category_csv
        ? values.needs_category_csv
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("phone", values.phone.trim());
      formData.append("ngo_name", values.ngo_name.trim());
      formData.append("registration_no", values.registration_no.trim());

      needs_category.forEach((c) =>
        formData.append("needs_category[]", c)
      );

      if (certificate) formData.append("certificate", certificate);

      const { data } = await API.put("/users/me", formData);

      setUser(data.user);
      setProfileData(data.profile);

      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-sky-600">NGO Profile</h1>
        </div>

        {!editMode ? (
          <div className="space-y-3">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
            <p><strong>NGO Name:</strong> {profileData?.ngo_name || "N/A"}</p>
            <p><strong>Registration No:</strong> {profileData?.registration_no || "N/A"}</p>

            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-sky-600 text-white px-4 py-2 rounded"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                {...register("name", {
                  required: "Name is required",
                  validate: (value) => {
                    if (value.trim().length < 3)
                      return "Minimum 3 characters";
                    if (!/^[A-Za-z ]+$/.test(value))
                      return "Only letters allowed";
                    return true;
                  },
                })}
                className="w-full border p-2 rounded"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("email", {
                  required: "Email required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...register("phone", {
                  required: "Phone required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Invalid Indian number",
                  },
                })}
                className="w-full border p-2 rounded"
              />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            {/* NGO NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">NGO Name</label>
              <input
                {...register("ngo_name", {
                  required: "NGO name required",
                })}
                className="w-full border p-2 rounded"
              />
              {errors.ngo_name && <p className="text-red-500">{errors.ngo_name.message}</p>}
            </div>

            {/* REGISTRATION */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration Number
              </label>
              <input
                {...register("registration_no", {
                  required: "Registration number required",
                  validate: (value) => {
                    if (value.trim().length < 5)
                      return "Minimum 5 characters";
                    if (!/^[A-Za-z0-9/-]+$/.test(value))
                      return "Invalid format";
                    return true;
                  },
                })}
                placeholder="e.g. NGO/12345/2024"
                className="w-full border p-2 rounded"
              />
              {errors.registration_no && (
                <p className="text-red-500">
                  {errors.registration_no.message}
                </p>
              )}
            </div>

            {/* FILE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* BUTTONS */}
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded ml-2"
            >
              Cancel
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default NGOProfile;