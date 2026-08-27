/**
 * Database Configuration & Memory/File Fallback Store
 * Connects to MongoDB if available; seamlessly falls back to an in-memory/file-persisted store
 * to ensure zero downtime during hackathon presentations even if MongoDB is not running locally.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let useFallback = false;
const FALLBACK_DIR = path.join(__dirname, '..', 'data', 'store');
const TRANSACTIONS_FILE = path.join(FALLBACK_DIR, 'transactions.json');
const AUDIT_FILE = path.join(FALLBACK_DIR, 'audit_logs.json');

// Memory store structures
const memoryStore = {
  transactions: new Map(),
  auditLogs: []
};

function ensureFallbackDirectory() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }
}

function persistStore() {
  try {
    ensureFallbackDirectory();
    const txList = Array.from(memoryStore.transactions.values());
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(txList, null, 2));
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(memoryStore.auditLogs, null, 2));
  } catch (err) {
    console.error('[Fallback Store] Error saving to disk:', err.message);
  }
}

function loadPersistedStore() {
  try {
    ensureFallbackDirectory();
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
      data.forEach(tx => memoryStore.transactions.set(tx.transactionId || tx._id, tx));
    }
    if (fs.existsSync(AUDIT_FILE)) {
      memoryStore.auditLogs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('[Fallback Store] Could not read existing files:', err.message);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/riskguard';
  
  try {
    console.log(`[DB] Attempting connection to MongoDB at ${mongoUri}...`);
    mongoose.set('strictQuery', false);
    
    // Set a fast 3-second connection timeout for local resilience
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    
    isConnected = true;
    useFallback = false;
    console.log('[DB] MongoDB Connected Successfully.');
  } catch (err) {
    console.warn(`[DB] MongoDB connection failed (${err.message}).`);
    console.log('[DB] Initializing High-Performance In-Memory/File Fallback Store for seamless demo operation.');
    useFallback = true;
    isConnected = false;
    loadPersistedStore();
  }
}

module.exports = {
  connectDB,
  isMongoDBConnected: () => isConnected,
  isUsingFallback: () => useFallback,
  memoryStore,
  persistStore,
  loadPersistedStore
};
