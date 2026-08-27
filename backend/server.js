/**
 * RiskGuard AI — Backend Server
 * Production-ready Express API with Helmet, Rate Limiting, CORS, and Seeder.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, isMongoDBConnected, isUsingFallback } = require('./config/db');
const { seedData } = require('./services/seeder');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route handlers
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const agentRoutes = require('./routes/agentRoutes');
const modelRoutes = require('./routes/modelRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate Limiting (500 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RiskGuard AI Payment Risk Backend',
    version: '1.0.0',
    database: isMongoDBConnected() ? 'MongoDB' : isUsingFallback() ? 'In-Memory/File Fallback Store' : 'Connecting...',
    timestamp: new Date().toISOString()
  });
});

// Seed endpoint (convenient for hackathon demos to reset demo data)
app.post('/api/seed', async (req, res, next) => {
  try {
    await seedData(true);
    res.json({
      success: true,
      message: 'Demo dataset re-seeded successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/model-performance', modelRoutes);
app.use('/api/audit-logs', auditRoutes);

// Catch 404
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

async function startServer() {
  await connectDB();
  await seedData(false);

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  RiskGuard AI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Storage Engine: ${isMongoDBConnected() ? 'MongoDB' : 'Resilient In-Memory/File Store'}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
