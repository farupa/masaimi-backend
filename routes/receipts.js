const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Receipt = require("../models/Receipt");
const { protect } = require("../middleware/auth");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
},
});

// POST /api/receipts — submit a receipt with image
router.post("/", protect, upload.single("receiptImage"), async (req, res) => {
  const { bankName, branchName, transactionId, depositAmount, depositDate, note } = req.body;

  if (!bankName || !branchName || !transactionId || !depositAmount || !depositDate) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const receipt = await Receipt.create({
      member: req.user._id,
      memberName: req.user.name,
      bankName,
      branchName,
      transactionId,
      depositAmount: Number(depositAmount),
      depositDate,
      note: note || "",
      receiptImage: imageUrl,
      status: "pending",
    });

    res.status(201).json({ message: "Receipt submitted successfully", receipt });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/receipts/me — get logged-in member's own receipts
router.get("/me", protect, async (req, res) => {
  try {
    const receipts = await Receipt.find({ member: req.user._id }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;