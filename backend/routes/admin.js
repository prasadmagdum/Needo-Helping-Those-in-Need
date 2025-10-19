// backend/routes/admin.js
const express = require("express");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/uplod"); // ✅ multer for certificate handling

const router = express.Router();

// ✅ Middleware: only admins can access these routes
router.use(auth, requireRole("admin"));

/**
 * 1. Dashboard Overview
 */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const verifiedNGOs = await NGO.countDocuments({ verified: true });
    const donors = await Donor.find();

    let totalDonations = 0;
    let completedDonations = 0;
    let activeDonations = 0;

    donors.forEach((d) => {
      totalDonations += d.donations.length;
      completedDonations += d.donations.filter((x) => x.status === "completed").length;
      activeDonations += d.donations.filter((x) => x.status === "available").length;
    });

    res.json({
      totalUsers,
      totalNGOs,
      verifiedNGOs,
      totalDonations,
      activeDonations,
      completedDonations,
    });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 2. User Management
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/users/:id/block", async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked },
      { new: true }
    ).select("-password_hash");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: `User ${blocked ? "blocked" : "unblocked"}`, user });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 3. NGO Verification
 */

// 🟢 Get NGOs (filter pending, verified, rejected)
router.get("/ngos", async (req, res) => {
  try {
    const status = req.query.status;
    let filter = {};
    if (status === "pending") filter.status = "pending";
    else if (status === "verified") filter.status = "verified";
    else if (status === "rejected") filter.status = "rejected";

    const ngos = await NGO.find(filter)
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// 🟢 Verify NGO + optional certificate upload (Admin)
router.put("/ngos/:id/verify", upload.single("certificate"), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    // Save uploaded certificate if provided
    if (req.file) {
      const certPath = `/uploads/certificates/${req.file.filename}`;
      ngo.certificateUrl = certPath;
    }

    // Update verification details
    ngo.status = "verified";
    ngo.verified = true;
    ngo.verifiedBy = req.user.id;
    ngo.verifiedAt = new Date();

    await ngo.save();
    res.json({ msg: "NGO verified successfully", ngo });
  } catch (err) {
    console.error("Verify NGO error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🟡 Reject NGO
router.delete("/ngos/:id/reject", async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    ngo.status = "rejected";
    ngo.verified = false;
    await ngo.save();

    res.json({ msg: "NGO rejected", ngo });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 4. Donation Management
 */
router.get("/donations", async (req, res) => {
  try {
    const donors = await Donor.find().populate("user_id", "name email phone");
    let donations = [];
    donors.forEach((d) => {
      d.donations.forEach((don) => {
        donations.push({
          ...don.toObject(),
          donor: {
            donor_id: d._id,
            org_name: d.org_name,
            user_name: d.user_id?.name,
            user_email: d.user_id?.email,
            user_phone: d.user_id?.phone,
          },
        });
      });
    });
    res.json(donations);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/donations/:donationId", async (req, res) => {
  try {
    const donor = await Donor.findOne({ "donations._id": req.params.donationId });
    if (!donor) return res.status(404).json({ msg: "Donation not found" });

    const donation = donor.donations.id(req.params.donationId);

    // remove photos if exist
    if (donation.photos && donation.photos.length > 0) {
      donation.photos.forEach((photoPath) => {
        const fullPath = path.join(__dirname, "..", photoPath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error("Failed to delete file:", fullPath, err.message);
        });
      });
    }

    donation.remove();
    await donor.save();

    res.json({ msg: "Donation deleted by Admin" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
