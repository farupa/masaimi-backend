const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Receipt = require("../models/Receipt");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/admin/members — all members (admin only)
router.get("/members", protect, adminOnly, async (req, res) => {
  try {
    const members = await User.find({ role: "member" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/admin/members/:id — approve or reject member
router.patch("/members/:id", protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Member not found" });
    res.json({ message: `Member ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/receipts — all receipts (admin only)
router.get("/receipts", protect, adminOnly, async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/admin/receipts/:id — verify or reject receipt
router.patch("/receipts/:id", protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!["verified", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json({ message: `Receipt ${status}`, receipt });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/members/public — approved members with total deposits (public)
router.get("/members/public", async (req, res) => {
  try {
    const members = await User.find({ role: "member", status: "approved" })
      .select("-password")
      .sort({ createdAt: -1 });

    // For each member, sum their verified receipts
    const membersWithTotals = await Promise.all(
      members.map(async (m) => {
        const receipts = await Receipt.find({
          member: m._id,
          status: "verified",
        });
        const totalDeposited = receipts.reduce(
          (sum, r) => sum + r.depositAmount, 0
        );
        return {
          _id: m._id,
          name: m.name,
          phone: m.phone,
          bankName: m.bankName,
          createdAt: m.createdAt,
          totalDeposited,
        };
      })
    );

    res.json(membersWithTotals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;