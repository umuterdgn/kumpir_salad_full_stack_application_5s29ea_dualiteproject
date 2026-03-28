import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// --- SOCKET.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: "*", // gerekirse frontend URL’sini yazabilirsin
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"], // fallback için
  },
});

app.set("io", io);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use("/api", routes);

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

// --- SERVE REACT BUILD ---
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
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
