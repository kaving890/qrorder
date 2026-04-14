const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true, min: 1 },
    capacity: { type: Number, required: true, default: 4 },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },
    qrCode: { type: String, default: "" },
    qrCodeUrl: { type: String, default: "" },
    location: { type: String, default: "Main Hall" },
    isActive: { type: Boolean, default: true },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true },
);

tableSchema.methods.generateQRCode = async function (baseUrl) {
  const url = `${baseUrl}/menu?table=${this.tableNumber}`;
  const dir = path.join(__dirname, "../public/qrcodes");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `table-${this.tableNumber}.png`);
  await QRCode.toFile(filePath, url, {
    color: { dark: "#1a1a2e", light: "#ffffff" },
    width: 300,
    margin: 2,
  });
  this.qrCode = url;
  const backendHost = process.env.BACKEND_URL?.replace(/\/$/, "") || "";
  this.qrCodeUrl = backendHost
    ? `${backendHost}/qrcodes/table-${this.tableNumber}.png`
    : `/qrcodes/table-${this.tableNumber}.png`;
  return this;
};

tableSchema.methods.ensureQRCodeFile = async function (baseUrl) {
  const dir = path.join(__dirname, "../public/qrcodes");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `table-${this.tableNumber}.png`);
  if (!fs.existsSync(filePath)) {
    await this.generateQRCode(baseUrl);
    await this.save();
  }
  return this;
};

module.exports = mongoose.model("Table", tableSchema);
