import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow CORS from frontend and ESP8266
const allowedOrigins = [
  'https://esp8266-eight.vercel.app', // Frontend
  'http://localhost:5173',           // Local dev
  'http://localhost:5000',           // Local backend
  'https://esp8266-ujnv.vercel.app', // Backend (for ESP8266 direct calls)
  '*',                               // ESP8266 (if needed, or use your local IP)
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like ESP8266)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/garden', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Receive data from ESP8266
app.post('/api/data', async (req, res) => {
  const { temperature, humidity } = req.body;
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const data = new SensorData({ temperature, humidity });
  await data.save();
  res.json({ success: true });
});

// Get latest value
app.get('/api/data/latest', async (req, res) => {
  const latest = await SensorData.findOne().sort({ timestamp: -1 });
  res.json(latest);
});

// Get historical data (last 100 entries)
app.get('/api/data/history', async (req, res) => {
  const history = await SensorData.find().sort({ timestamp: -1 }).limit(100);
  res.json(history.reverse());
});

// Pump trigger state (in-memory for demo)
let pumpTriggered = false;

app.post('/api/pump', (req, res) => {
  pumpTriggered = true;
  setTimeout(() => { pumpTriggered = false; }, 5000); // auto-reset after 5s
  res.json({ success: true });
});

app.get('/api/pump', (req, res) => {
  res.json({ triggered: pumpTriggered });
});

// Vercel compatibility: export app
export default app;

// Only listen if not in Vercel (local dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}
