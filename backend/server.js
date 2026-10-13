require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const corsOrigin = process.env.CORS_ORIGIN;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI. Copy .env.example to .env and set it.');
  process.exit(1);
}

// ---------- Middleware ----------
app.use(
  cors({
    origin: !corsOrigin || corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '100kb' }));

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Personal Expense Tracker API is running' });
});
app.use('/expenses', expenseRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ---------- Centralised error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Bad casts (e.g. amount: "abc", invalid date)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field "${err.path}"`,
    });
  }

  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ---------- Start ----------
let server;

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);
  if (server) server.close();
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start();
