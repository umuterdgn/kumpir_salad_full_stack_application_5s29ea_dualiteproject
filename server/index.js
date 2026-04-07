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
// --- SOCKET.IO CONNECTION ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("call_waiter", async (data) => {
    try {
      // Veritabanına kaydet
      const newCall = new Call({
        table: data.table,
        phone: data.phone, // Frontend'den gönderdiğimiz telefon numarası
        time: data.time || new Date(),
      });

      await newCall.save();
      console.log("Garson çağrısı DB'ye kaydedildi:", data.table);

      // Kaydedilen veriyi herkese (özellikle garson paneline) gönder
      io.emit("waiter_called", {
        id: newCall._id, // DB'deki ID'sini de gönderiyoruz ki ilerde güncellenebilsin
        ...data,
      });
    } catch (err) {
      console.error("DB Kayıt Hatası:", err);
    }
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
// --- DATABASE MODELS ---
const CallSchema = new mongoose.Schema({
  table: String,
  phone: String,
  time: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // "pending" veya "completed" gibi
});

const Call = mongoose.model("Call", CallSchema);
// --- FRANCHISE MODEL ---
const FranchiseSchema = new mongoose.Schema({
  name: String,
  phone: String,
  city: String,
  investment: String,
  message: String,
  status: { type: String, default: "new" },
  createdAt: { type: Date, default: Date.now },
});
const Franchise = mongoose.model("Franchise", FranchiseSchema);

// --- FRANCHISE API ROUTE ---
app.post("/api/franchise", async (req, res) => {
  try {
    const newApplication = await Franchise.create(req.body);

    // Aynı zamanda garson paneline veya admin paneline bildirim göndermek istersen:
    const io = req.app.get("io");
    io.emit("new_franchise_alert", {
      message: `Yeni Franchise Başvurusu: ${req.body.name}`,
      city: req.body.city,
    });

    res.status(201).json({ success: true, data: newApplication });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Başvuruları listele (Admin yetkisiyle)
app.get("/api/franchise", async (req, res) => {
  const apps = await Franchise.find().sort({ createdAt: -1 });
  res.json(apps);
});

// Başvuru sil
app.delete("/api/franchise/:id", async (req, res) => {
  await Franchise.findByIdAndDelete(req.params.id);
  res.json({ success: true });
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
