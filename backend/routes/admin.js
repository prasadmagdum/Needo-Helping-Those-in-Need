const express = require("express");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ✅ Middleware: only admins can access these routes
router.use(auth, requireRole("admin"));

/**
 * 1. Dashboard Overview
 * GET /api/admin/stats
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
// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Block / Unblock user (toggle with blocked: true/false)
router.put("/users/:id/block", async (req, res) => {
  try {
    const { blocked } = req.body; // expects { blocked: true/false }
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

// Delete user
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
// Get NGOs (filter pending)
router.get("/ngos", async (req, res) => {
  try {
    const status = req.query.status;
    let ngos;
    if (status === "pending") {
      ngos = await NGO.find({ verified: false }).populate("user_id", "name email phone");
    } else {
      ngos = await NGO.find().populate("user_id", "name email phone");
    }
    res.json(ngos);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Verify / Unverify NGO
router.put("/ngos/:id/verify", async (req, res) => {
  try {
    const { verified } = req.body; // expects { verified: true/false }
    const ngo = await NGO.findByIdAndUpdate(req.params.id, { verified }, { new: true });
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    res.json({ msg: `NGO ${verified ? "verified" : "unverified"}`, ngo });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Reject NGO (delete)
router.delete("/ngos/:id/reject", async (req, res) => {
  try {
    await NGO.findByIdAndDelete(req.params.id);
    res.json({ msg: "NGO rejected and deleted" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 4. Donation Management
 */
// Get all donations
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

// Delete donation
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
