const express = require("express");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/uplod");

const router = express.Router();

// 🔐 Only Admins Can Access
router.use(auth, requireRole("admin"));

/* ===========================================================
   1) ADMIN DASHBOARD STATS
   =========================================================== */
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
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================================================
   2) USER MANAGEMENT
   =========================================================== */
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

/* ===========================================================
   3) NGO VERIFICATION
   =========================================================== */
router.get("/ngos", async (req, res) => {
  try {
    let filter = {};
    if (req.query.status) filter.status = req.query.status;

    const ngos = await NGO.find(filter)
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/ngos/:id/verify", upload.single("certificate"), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    if (req.file) {
      ngo.certificateUrl = `/uploads/certificates/${req.file.filename}`;
    }

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

/* ===========================================================
   4) DONATION MANAGEMENT
   =========================================================== */

// Fetch ALL Donations for Admin Panel
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

/* ===========================================================
   DELETE DONATION (Admin)
   FIXED: Deletes from DB + Deletes photo files
   =========================================================== */
router.delete("/donations/:donationId", async (req, res) => {
  try {
    const donationId = req.params.donationId;

    // 1️⃣ Find donor containing this donation
    const donor = await Donor.findOne({ "donations._id": donationId });
    if (!donor) return res.status(404).json({ msg: "Donation not found" });

    // 2️⃣ Find specific donation entry
    const donation = donor.donations.id(donationId);

    // 3️⃣ Delete Photos if Exist
    if (donation?.photos?.length > 0) {
      donation.photos.forEach((photo) => {
        const filePath = path.join(__dirname, "..", photo);
        fs.unlink(filePath, (err) => {
          if (err) console.error("File delete failed:", filePath, err.message);
        });
      });
    }

    // 4️⃣ Remove donation entry from DB
    donation.deleteOne();
    await donor.save();

    res.json({ msg: "Donation deleted successfully" });
  } catch (err) {
    console.error("Delete donation error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================================================
   5) ANALYTICS
   =========================================================== */
router.get("/top-donors", async (req, res) => {
  try {
    const donors = await Donor.find().populate("user_id", "name email").lean();

    const ranked = donors
      .map((d) => ({
        name: d.user_id?.name || "Unknown Donor",
        email: d.user_id?.email || "N/A",
        totalDonations: d.donations?.length || 0,
      }))
      .filter((d) => d.totalDonations > 0)
      .sort((a, b) => b.totalDonations - a.totalDonations)
      .slice(0, 5);

    res.json(ranked);
  } catch (err) {
    console.error("Top donors error:", err);
    res.status(500).json({ msg: "Failed to load top donors" });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const [recentUsers, recentNGOs, recentDonations] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      NGO.find().sort({ updatedAt: -1 }).limit(5).select("ngo_name status updatedAt"),
      Donor.aggregate([
        { $unwind: "$donations" },
        { $sort: { "donations.createdAt": -1 } },
        { $limit: 5 },
        {
          $project: {
            title: "$donations.title",
            status: "$donations.status",
            createdAt: "$donations.createdAt",
          },
        },
      ]),
    ]);

    const activities = [
      ...recentUsers.map((u) => ({
        type: "User Signup",
        detail: `${u.name} registered as ${u.role}`,
        timestamp: u.createdAt,
      })),
      ...recentNGOs.map((n) => ({
        type: "NGO Update",
        detail: `${n.ngo_name} is now ${n.status}`,
        timestamp: n.updatedAt,
      })),
      ...recentDonations.map((d) => ({
        type: "Donation Added",
        detail: `${d.title} (${d.status})`,
        timestamp: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(activities);
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ msg: "Failed to load activity feed" });
  }
});

module.exports = router;
