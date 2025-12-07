const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const accountRoutes = require('./routes/account');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow credentials so cookies can be set by the API
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
  credentials: true 
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/account', accountRoutes);

module.exports = app;
