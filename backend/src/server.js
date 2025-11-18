const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('../config/database');

// Import routes
const customersRouter = require('./routes/customers');
const vehiclesRouter = require('./routes/vehicles');
const policiesRouter = require('./routes/policies');
const claimsRouter = require('./routes/claims');
const carMakesRouter = require('./routes/carMakes');
const carModelsRouter = require('./routes/carModels');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'QIIC Insurance API',
    version: '1.0.0',
    database: dbConnected ? 'connected' : 'disconnected',
    databaseType: 'MySQL'
  });
});

// API Routes
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/policies', policiesRouter);
app.use('/api/v1/claims', claimsRouter);
app.use('/api/v1/car-makes', carMakesRouter);
app.use('/api/v1/car-models', carModelsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to QIIC - Qatar Insurance & Indemnity Company API',
    version: '1.0.0',
    database: 'MySQL',
    endpoints: {
      customers: '/api/v1/customers',
      vehicles: '/api/v1/vehicles',
      policies: '/api/v1/policies',
      claims: '/api/v1/claims',
      carMakes: '/api/v1/car-makes',
      carModels: '/api/v1/car-models',
      health: '/health'
    },
    documentation: 'https://api.qiic.qa/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting QIIC Insurance API Server...');
    console.log('====================================');
    
    // Test MySQL Database Connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Warning: Database connection failed. Server will start but API may not work properly.');
      console.warn('⚠️  Please check your MySQL configuration in .env file');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 QIIC API Server is running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: MySQL`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
      console.log('====================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
