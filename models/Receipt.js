const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    depositDate: {
      type: String,
      required: true,
    },
    receiptImage: {
      type: String, // URL string — Cloudinary later, file path for now
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);