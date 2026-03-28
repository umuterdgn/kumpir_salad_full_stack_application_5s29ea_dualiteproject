import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes.js";

// ⬇️ EKLENDİ
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.set("io", io);

app.use("/api", routes);

// ⬇️ EKLENDİ (frontend serve)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("call_waiter", (data) => {
    io.emit("waiter_called", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kumpirsalad";

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error. Running without DB...",
      err.message,
    );
  });
