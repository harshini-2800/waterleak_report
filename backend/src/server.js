require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

// Enable CORS with all local dev origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static image uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API router mount
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'WaterLeak Watch API',
    tagline: 'Every Drop Matters. Every Leak Counts.',
    documentation: '/api/status',
    database: getDBStatus()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Helper to listen with port fallback so EADDRINUSE never crashes nodemon
const listenWithFallback = (serverApp, port, maxAttempts = 5) => {
  return new Promise((resolve, reject) => {
    let currentPort = port;
    let attempts = 0;

    const tryListen = () => {
      const server = serverApp.listen(currentPort, () => {
        resolve({ server, port: currentPort });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Server] Port ${currentPort} is busy. Trying port ${currentPort + 1}...`);
          attempts++;
          if (attempts >= maxAttempts) {
            return reject(new Error(`Failed to bind server after ${maxAttempts} attempts.`));
          }
          currentPort++;
          setTimeout(tryListen, 200);
        } else {
          reject(err);
        }
      });
    };

    tryListen();
  });
};

// Initialize Database and launch server
const startServer = async () => {
  await connectDB();

  // Auto-seed sample reports if collection is empty so user can immediately demo
  try {
    const { isMongoose, embeddedDB } = require('./config/db');
    const Report = require('./models/Report');
    const sampleReports = require('./scripts/sampleReports');

    let count = 0;
    if (isMongoose()) {
      count = await Report.countDocuments();
      if (count === 0) {
        await Report.insertMany(sampleReports);
        console.log(`[AutoSeed] First launch: Inserted ${sampleReports.length} demo reports into MongoDB.`);
      }
    } else {
      count = await embeddedDB.reports.count({});
      if (count === 0) {
        for (const r of sampleReports) {
          await embeddedDB.reports.insert(r);
        }
        console.log(`[AutoSeed] First launch: Inserted ${sampleReports.length} demo reports into Embedded Database.`);
      }
    }
  } catch (err) {
    console.warn('[AutoSeed Warning]:', err.message);
  }

  try {
    const { port: boundPort } = await listenWithFallback(app, DEFAULT_PORT);
    console.log(`\n=================================================`);
    console.log(`💧 WaterLeak Watch Backend Server Running!`);
    console.log(`📡 URL: http://localhost:${boundPort}`);
    console.log(`🗄️ Database: ${getDBStatus().type}`);
    console.log(`📂 Uploads: ${uploadsPath}`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error('[Server Start Error]:', err.message);
  }
};

startServer();
