const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const { redirect } = require('./controllers/urlController');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/url-shortener');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);

// Public redirection route (must be defined after API routes to avoid matching conflicts)
app.get('/:shortCode', redirect);

// Root route placeholder (if visited directly)
app.get('/', (req, res) => {
  res.send('URL Shortener API is running...');
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error Handler:', err.stack);
  
  // Mongoose validation or duplicate key errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, error: message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, error: `Duplicate field value entered for ${field}` });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
