import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import { Loader2, Edit3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const DonorProfile = () => {
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

  // 🔹 Load Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");

        reset({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
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

  // 🔹 Submit
  const onSubmit = handleSubmit(async (values) => {
    try {
      setSaving(true);

      const { data } = await API.put("/users/me", {
        name: values.name.trim(),
        phone: values.phone.trim(),
      });

      setUser(data.user);

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

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-sky-600">Donor Profile</h1>
        </div>

        {/* VIEW MODE */}
        {!editMode ? (
          <div className="space-y-3">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>

            <button
              onClick={() => setEditMode(true)}
              className="mt-4 flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
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
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-sky-200"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
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
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Invalid Indian number",
                  },
                })}
                className="w-full border rounded-lg p-2"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>

              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default DonorProfile;