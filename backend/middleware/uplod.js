const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔹 Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 🔹 Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // All uploads (certificates, etc.) go directly in /uploads
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

// 🔹 File filter for allowed types
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;
