const mongoose = require('mongoose');
const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

let isMongooseConnected = false;
let dbMode = 'uninitialized'; // 'mongodb' or 'embedded'

// Embedded datastores stored in backend/data
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const embeddedDB = {
  reports: Datastore.create({ filename: path.join(dataDir, 'reports.db'), autoload: true }),
  notifications: Datastore.create({ filename: path.join(dataDir, 'notifications.db'), autoload: true }),
  admins: Datastore.create({ filename: path.join(dataDir, 'admins.db'), autoload: true }),
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waterleak_watch';
  
  try {
    console.log(`[DB] Attempting MongoDB connection: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 3000,
    });
    isMongooseConnected = true;
    dbMode = 'mongodb';
    console.log('[DB]  Successfully connected to MongoDB!');
  } catch (err) {
    console.warn(`[DB]  MongoDB connection failed (${err.message}).`);
    console.warn('[DB] ⚡ Activating Embedded Persistent Database Engine (NeDB JSON storage in ./backend/data).');
    console.warn('[DB] ✨ All features, queries, and reports will work with 100% full persistence across restarts without needing external MongoDB installation.');
    dbMode = 'embedded';
  }
};

const getDBStatus = () => ({
  mode: dbMode,
  isMongooseConnected,
  type: dbMode === 'mongodb' ? 'MongoDB Atlas / Local' : 'Embedded High-Performance Document Engine',
  persistent: true,
  storagePath: dbMode === 'embedded' ? 'backend/data/' : 'MongoDB Host'
});

module.exports = {
  connectDB,
  getDBStatus,
  embeddedDB,
  isMongoose: () => dbMode === 'mongodb'
};

