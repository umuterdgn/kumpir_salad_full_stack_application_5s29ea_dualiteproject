import "dotenv/config"; // Bu satır en üstte olmalı!
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Vercel Linkini .env dosyasından alacağız, yoksa lokale/herkese izin verecek
const frontendURL = process.env.FRONTEND_URL || "*";

// --- SOCKET.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: frontendURL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    transports: ["websocket", "polling"], // fallback için
    credentials: true,
  },
});

app.set("io", io);

// --- MIDDLEWARE ---
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  }),
);
app.use(express.json());

// --- API ROUTES ---
app.use("/api", routes);

// Render Sağlık Kontrolü (Linke tıkladığında sunucunun çalıştığını gösterir)
app.get("/", (req, res) => {
  res.send("Kumpir Salad API Render üzerinde tıkır tıkır çalışıyor! 🚀");
});

// --- SOCKET.IO CONNECTION ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("call_waiter", (data) => {
    io.emit("waiter_called", data); // Broadcast to all
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kumpirsalad";

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) =>
    console.error(
      "MongoDB connection error. Running without DB...",
      err.message,
    ),
  );
