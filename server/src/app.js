const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow credentials so cookies can be set by the API
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

module.exports = app;
