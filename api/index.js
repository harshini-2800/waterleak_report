const express = require('express');
const cors = require('cors');
const { connectDB } = require('../backend/src/config/db');
const apiRoutes = require('../backend/src/routes/api');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

app.use('/api', apiRoutes);

module.exports = app;
