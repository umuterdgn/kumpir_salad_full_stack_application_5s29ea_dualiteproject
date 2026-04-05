import express from "express";
import bcrypt from "bcryptjs";
import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import { User, Category, Product, Order, Event } from "./models.js";

import dotenv from "dotenv";
dotenv.config();
// Yeni eklenen kütüphaneler
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "kumpir_super_gizli_anahtar_123";

// Middleware (Güvenlik Kalkanı)
const authGuard = (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Erişim reddedildi." });

  token = token.replace(/^"(.*)"$/, "$1").trim();

  try {
    const verified = verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token Doğrulama Hatası:", err.message);
    res.status(400).json({ error: "Geçersiz token." });
  }
};

// --- CLOUDINARY & MULTER AYARLARI ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- UPLOAD (RESİM YÜKLEME) ---
router.post("/upload", authGuard, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Lütfen bir resim dosyası seçin." });
  }
// --- UPLOAD (RESİM YÜKLEME) ---
router.post("/upload", authGuard, upload.single("image"), (req, res) => {
  // TEST KODU: Bakalım Node.js şifreleri okuyabiliyor mu?
  console.log("==== TEST ====");
  console.log("Bulunan Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("Bulunan API Key:", process.env.CLOUDINARY_API_KEY);
  console.log("==============");

  if (!req.file) {
    return res.status(400).json({ error: "Lütfen bir resim dosyası seçin." });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "kumpir-salad-menu" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary Hatası:", error);
        return res.status(500).json({ error: "Resim yüklenirken bir hata oluştu." });
      }
      res.json({ imageUrl: result.secure_url });
    },
  );

  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);
  readableStream.pipe(uploadStream);
});
  // ÇÖZÜM BURADA: Ayarları tam resim yüklenirken yapıyoruz ki .env kesinlikle okunmuş olsun!
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Resmi Cloudinary'ye gönderen akış (stream)
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "kumpir-salad-menu" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary Hatası:", error);
        return res
          .status(500)
          .json({ error: "Resim yüklenirken bir hata oluştu." });
      }

      // Başarılı yükleme, frontend'e URL'i gönderiyoruz
      res.json({ imageUrl: result.secure_url });
    },
  );

  // Buffer'ı okunabilir akışa çevirip Cloudinary'ye besliyoruz
  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);
  readableStream.pipe(uploadStream);
});
// --- AUTH (GİRİŞ VE KURULUM) ---
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Kullanıcı bulunamadı." });
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Hatalı şifre." });

    const token = sign({ _id: user._id, role: user.role }, SECRET_KEY);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login Hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES ---
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort("order");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/categories", authGuard, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json(category);
  } catch (err) {
    console.error("Kategori Ekleme Hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/categories/:id", authGuard, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/categories/:id", authGuard, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ---
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products", authGuard, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/products/:id", authGuard, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/products/:id", authGuard, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ---
router.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    req.app.get("io").emit("new_order", order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders", authGuard, async (req, res) => {
  try {
    const orders = await Order.find().sort("-createdAt");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/orders/:id/status", authGuard, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    req.app.get("io").emit("order_updated", order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/orders/:id", authGuard, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/orders/:id", authGuard, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EVENTS (Analytics) ---
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", authGuard, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: "Tamamlandı" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;
    const events = await Event.aggregate([
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]);
    res.json({ totalOrders, totalRevenue, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
