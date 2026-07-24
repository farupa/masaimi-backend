const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const receiptRoutes = require("./routes/receipts");
const adminRoutes = require("./routes/admin");
const User = require("./models/User");

const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000"
].filter(Boolean);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://masaimi.vercel.app",
    "https://masaimi-ai7m19md8-farzana1.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "MASAIMI API running" }));

const mongoUri = process.env.MONGO_URI || "mongodb+srv://masaimi:masaimi12345@cluster0.znyy2.mongodb.net/masaimi?retryWrites=true&w=majority&appName=Cluster0";
const mongoDbName = process.env.MONGO_DB_NAME || "masaimi";

const ensureDefaultAdmin = async () => {
  try {
    const adminPhone = process.env.ADMIN_PHONE || "01799349013";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    let admin = await User.findOne({ phone: adminPhone });

    if (!admin) {
      admin = await User.create({
        name: "Admin One",
        phone: adminPhone,
        password: adminPassword,
        role: "admin",
        status: "approved",
      });
      console.log("Default admin created successfully");
    } else {
      console.log("Default admin already exists");
    }
  } catch (error) {
    console.error("Error ensuring default admin:", error);
  }
};

mongoose
  .connect(mongoUri, { dbName: mongoDbName })
  .then(async () => {
    console.log(`MongoDB connected to database: ${mongoDbName}`);
    await ensureDefaultAdmin();
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));