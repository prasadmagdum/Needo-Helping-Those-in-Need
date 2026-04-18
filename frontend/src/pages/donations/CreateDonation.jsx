import React, { useEffect, useRef, useState } from "react";
import { PlusCircle, MapPin, Camera, X, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";

const MAX_FILES = 4;

const CreateDonation = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    quantity: "",
    pickup_location: "",
    pickup_by: "",
    urgent: false,
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    "Food Surplus",
    "Clothes",
    "Educational Items",
    "Medical",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFiles = (newFiles) => {
    const list = Array.from(newFiles);
    if (files.length + list.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} photos.`);
      return;
    }
    const images = list.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.pickup_location) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, typeof value === "boolean" ? value.toString() : value);
      });
      files.forEach((file) => formData.append("photos", file));

      await API.post("/donations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("🎉 Donation added successfully!");
      setForm({
        title: "",
        category: "",
        description: "",
        quantity: "",
        pickup_location: "",
        pickup_by: "",
        urgent: false,
      });
      setFiles([]);
      setTimeout(() => navigate("/my-donations"), 2000);
    } catch (err) {
      console.error("Error adding donation:", err);
      toast.error(err?.response?.data?.msg || "Error adding donation");
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dtFiles = e.dataTransfer.files;
    if (dtFiles && dtFiles.length) handleFiles(dtFiles);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-yellow-100 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6 text-gray-800">
          <PlusCircle className="text-yellow-500" />
          Create Donation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category + Quantity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g., 5 boxes"
                min="1"
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Short donation title"
              required
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your items, condition, or other details"
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Pickup Location & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Location *</label>
              <div className="flex items-center border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50">
                <MapPin className="text-gray-500 mr-2" />
                <input
                  type="text"
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleChange}
                  placeholder="Enter your pickup address"
                  required
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pickup By</label>
              <input
                type="date"
                name="pickup_by"
                value={form.pickup_by}
                onChange={handleChange}
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Urgent */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="urgent"
                checked={form.urgent}
                onChange={handleChange}
              />
              <span>Mark as urgent</span>
            </label>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 rounded-lg p-6 text-center transition ${
              dragOver
                ? "border-yellow-400 bg-yellow-50"
                : "border-dashed border-yellow-300 bg-white"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-gray-600 mb-2">
              Drag & drop or click to upload (max {MAX_FILES} images)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-full h-24 border rounded-lg overflow-hidden group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create Donation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
