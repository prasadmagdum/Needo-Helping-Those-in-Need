const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngo_name: { type: String, required: true },
    registration_no: { type: String, required: true },
    needs_category: [String],

    // 🔹 New field for Admin verification
    verified: { type: Boolean, default: false }, // only verified NGOs can fully operate
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
