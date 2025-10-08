const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// 🟢 Public route
router.get("/public", (req, res) => {
  res.json({ msg: "Anyone can see this" });
});

// 🟡 Protected route (any logged-in user)
router.get("/dashboard", auth(), (req, res) => {
  res.json({ msg: `Hello ${req.user.role}, you can see your dashboard` });
});

// 🔴 Admin-only route
router.get("/admin/users", auth(["admin"]), (req, res) => {
  res.json({ msg: "Only admins can manage users" });
});

module.exports = router;
