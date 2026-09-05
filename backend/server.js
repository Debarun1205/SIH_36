import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import instrumentRoutes from "./routes/instrumentRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import toleranceRoutes from "./routes/toleranceRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "15mb" })); // generous limit: evidence photos travel as base64
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "SIH36 Instrument Verification API" });
});
app.get("/api/health", (req, res) => res.json({ status: "healthy", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tolerance-rules", toleranceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
