const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔹 Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const certDir = path.join(uploadDir, "certificates");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

// 🔹 Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // NGO certificates will go inside /uploads/certificates
    cb(null, certDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

// 🔹 File filter for security
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only PDF, JPG, PNG allowed."));
  }
  cb(null, true);
};

// 🔹 Multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
