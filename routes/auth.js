const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, phone, password, bankName } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const user = await User.create({
      name,
      phone,
      password,
      bankName: bankName || "",
      role: "member",
      status: "pending",
    });

    res.status(201).json({
      message: "Registration submitted. Awaiting admin approval.",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Please enter phone and password" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    if (user.role === "member" && user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is pending admin approval. Please wait.",
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        bankName: user.bankName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;