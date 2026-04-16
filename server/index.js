const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const Table = require("./models/Table");

dotenv.config();

const app = express();
const getFrontendUrl = () => process.env.CLIENT_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/tables", require("./routes/tables"));
app.use("/api/admin", require("./routes/admin"));

// Regenerate missing QR code files on demand
app.get("/qrcodes/table-:tableNumber.png", async (req, res, next) => {
  try {
    const table = await Table.findOne({
      tableNumber: parseInt(req.params.tableNumber, 10),
    });
    if (table) {
      await table.generateQRCode(getFrontendUrl());
      await table.save();
    }
  } catch (err) {
    console.error("QR regeneration error:", err);
  }
  next();
});

// Serve QR code static files
app.use("/qrcodes", express.static(path.join(__dirname, "public", "qrcodes")));

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/qr_food_ordering",
  )
  .then(() => {
    console.log("✅ MongoDB connected");
    return Table.find({ isActive: true })
      .then(async (tables) => {
        const baseUrl = getFrontendUrl();
        await Promise.all(
          tables.map(async (table) => {
            await table.generateQRCode(baseUrl);
            await table.save();
          }),
        );
      })
      .then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
      });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
