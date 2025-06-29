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
  'https://esp8266-server.vercel.app', // Backend (for ESP8266 direct calls)
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

// Receive data from ESP8266 (accept both /api/data and /api/data/)
app.post(['/api/data', '/api/data/'], async (req, res) => {
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


// Get historical data, supports ?since=timestamp (ms since epoch) and ?limit=number
app.get('/api/data/history', async (req, res) => {
  let { since, limit } = req.query;
  let query = {};
  if (since) {
    const sinceDate = new Date(Number(since));
    if (!isNaN(sinceDate.getTime())) {
      query.timestamp = { $gte: sinceDate };
    }
  }
  let lim = 100;
  if (limit) {
    const parsed = parseInt(limit);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 5000) lim = parsed;
  } else if (since) {
    lim = 1000; // If filtering by time, allow more points
  }
  const history = await SensorData.find(query).sort({ timestamp: -1 }).limit(lim);
  res.json(history.reverse());
});



// Pump status state is now persisted in MongoDB
const pumpStatusSchema = new mongoose.Schema({
  status: { type: Boolean, required: true },
  updatedAt: { type: Date, default: Date.now }
});
// Only one document will exist in this collection
const PumpStatus = mongoose.model('PumpStatus', pumpStatusSchema);

// Helper to get current pump status (returns Boolean, defaults to false if not set)
async function getPumpStatus() {
  const doc = await PumpStatus.findOne();
  return doc ? doc.status : false;
}

// Helper to set pump status (creates or updates singleton doc)
async function setPumpStatus(on) {
  let doc = await PumpStatus.findOne();
  if (!doc) {
    doc = new PumpStatus({ status: on });
  } else {
    doc.status = on;
    doc.updatedAt = new Date();
  }
  await doc.save();
  return doc.status;
}

// Pump status change log schema
const pumpLogSchema = new mongoose.Schema({
  status: Boolean,
  timestamp: { type: Date, default: Date.now },
  source: String, // e.g. 'user', 'api', 'device', etc.
  ip: String,
  note: String, // 'valid' or 'invalid'
  body: String // for invalid attempts
});
const PumpLog = mongoose.model('PumpLog', pumpLogSchema);

// Set pump state (on/off)

app.post('/api/pump', async (req, res) => {
  const { on } = req.body;
  let logStatus = null;
  let logNote = '';
  if (typeof on === 'boolean') {
    // Persist status in DB
    let newStatus;
    try {
      newStatus = await setPumpStatus(on);
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Failed to update pump status' });
    }
    logStatus = on;
    logNote = 'valid';
    // Log the change to the database
    try {
      await PumpLog.create({
        status: on,
        source: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
        note: logNote
      });
    } catch (e) {
      // Logging failure should not block the main response
      console.error('Failed to log pump status change:', e);
    }
    return res.json({ success: true, status: newStatus });
  } else {
    // Log invalid/malformed attempts
    logStatus = null;
    logNote = 'invalid';
    try {
      await PumpLog.create({
        status: null,
        source: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
        note: logNote,
        body: JSON.stringify(req.body)
      });
    } catch (e) {
      console.error('Failed to log invalid pump status attempt:', e);
    }
    // Always return the current status from DB
    let currentStatus = false;
    try {
      currentStatus = await getPumpStatus();
    } catch {}
    res.status(400).json({ success: false, status: currentStatus, error: 'Invalid body' });
  }
});
// Endpoint to get pump status change logs (latest 50)
app.get('/api/pump/logs', async (req, res) => {
  try {
    const logs = await PumpLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.get('/api/pump', async (req, res) => {
  let status = false;
  try {
    status = await getPumpStatus();
  } catch {}
  res.json({ status });
});

// Health check endpoint
app.get('/api/ping', (req, res) => res.json({ ping: true }));

// Test endpoint
app.post('/api/test', (req, res) => {
  res.json({ ok: true });
});

// Redirect trailing slashes (except for root and API POST endpoints)
app.use((req, res, next) => {
  // Do not redirect POST requests to /api/data or /api/pump
  if (
    req.method === 'POST' &&
    (req.path === '/api/data/' || req.path === '/api/pump/')
  ) {
    return next();
  }
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// Vercel compatibility: export app
export default app;

// Only listen if not in Vercel (local dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}
