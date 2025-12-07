const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
	const { firstName, middleInitial, lastName, contactNumber, region, country, city, address, postalCode, username, email, password } = req.body || {};
	if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

	try {
		// check existing
		const [rows] = await pool.execute('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
		if (rows.length) return res.status(409).json({ error: 'Username or email already used' });

		const passwordHash = await bcrypt.hash(password, 12);
		const [result] = await pool.execute(
			`INSERT INTO users (first_name, middle_initial, last_name, contact_number, region, country, city, street_address, postal_code, username, email, password_hash)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[firstName || null, middleInitial || null, lastName || null, contactNumber || null, region || null, country || null, city || null, address || null, postalCode || null, username, email, passwordHash]
		);

		return res.status(201).json({ id: result.insertId });
	} catch (err) {
		console.error('Register error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
	const { username, password } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

	try {
		const [rows] = await pool.execute('SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1', [username, username]);
		if (!rows.length) return res.status(401).json({ error: 'Invalid username or password' });

		const user = rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) return res.status(401).json({ error: 'Invalid username or password' });

		// Success - sign JWT and set as HttpOnly cookie
		const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

		// set cookie (HttpOnly, secure in production)
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		return res.status(200).json({ id: user.id, username: user.username, email: user.email });
	} catch (err) {
		console.error('Login error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/auth/me - returns current user if authenticated
router.get('/me', requireAuth, async (req, res) => {
	try {
		const { id } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });
		const [rows] = await pool.execute('SELECT id, first_name AS firstName, middle_initial AS middleInitial, last_name AS lastName, contact_number AS contactNumber, profile_picture AS profilePicture, username, email, created_at AS createdAt FROM users WHERE id = ? LIMIT 1', [id]);
		if (!rows.length) return res.status(404).json({ error: 'User not found' });
		return res.json(rows[0]);
	} catch (err) {
		console.error('Me error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/auth/logout - clears auth cookie
router.post('/logout', (req, res) => {
	res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' });
	return res.json({ ok: true });
});

module.exports = router;

