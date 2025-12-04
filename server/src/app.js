const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

module.exports = app;
