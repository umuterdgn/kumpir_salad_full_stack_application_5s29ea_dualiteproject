import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.set('io', io);

// --- API rotaları ---
app.use('/api', routes);

// --- FRONTEND SERVE ---
// __dirname tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dist klasör yolu (proje kökünde dist varsa)
const distPath = path.join(__dirname, '../dist');

// Static serve
app.use(express.static(distPath));

// React Router fallback (tüm SPA yolları için index.html döndür)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('call_waiter', (data) => {
    io.emit('waiter_called', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumpirsalad';

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- MONGODB CONNECT ---
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error. Running without DB...', err.message));
