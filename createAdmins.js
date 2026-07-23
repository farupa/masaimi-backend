require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const admins = [
  { name: "Admin One", phone: "01799349013", password: "admin123", role: "admin", status: "approved" },
  { name: "Admin Two", phone: "01700000000", password: "admin456", role: "admin", status: "approved" },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("MongoDB connected");

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