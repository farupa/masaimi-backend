require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const admins = [
  {
    name: "Admin One",
    phone: process.env.ADMIN_PHONE || "01799349013",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
    status: "approved",
  },
  {
    name: "Admin Two",
    phone: process.env.ADMIN_TWO_PHONE || "01700000000",
    password: process.env.ADMIN_TWO_PASSWORD || "admin456",
    role: "admin",
    status: "approved",
  },
];

const mongoUri = process.env.MONGO_URI || "mongodb+srv://masaimi:masaimi12345@cluster0.znyy2.mongodb.net/masaimi?retryWrites=true&w=majority&appName=Cluster0";
const mongoDbName = process.env.MONGO_DB_NAME || "masaimi";

mongoose.connect(mongoUri, { dbName: mongoDbName }).then(async () => {
  console.log(`MongoDB connected to database: ${mongoDbName}`);

  for (const admin of admins) {
    const exists = await User.findOne({ phone: admin.phone });
    if (!exists) {
      await User.create(admin);
      console.log(`Admin created: ${admin.phone}`);
    } else {
      console.log(`Admin already exists: ${admin.phone}`);
    }
  }

  mongoose.disconnect();
});