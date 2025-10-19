// backend/models/NGO.js
const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ngo_name: {
      type: String,
      required: true,
    },

    registration_no: {
      type: String,
      required: true,
    },

    needs_category: [String],

    // 📄 Certificate upload (PDF or Image)
    certificateUrl: {
      type: String,
      default: "", // /uploads/certificates/filename.pdf
    },

    // 🟡 Verification status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // ✅ Old flag (for compatibility)
    verified: {
      type: Boolean,
      default: false,
    },

    // 🧾 Tracking who verified and when
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
