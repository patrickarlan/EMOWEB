const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
	const { firstName, middleInitial, lastName, contactNumber, username, email, password } = req.body || {};
	if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

	try {
		// check existing
		const [rows] = await pool.execute('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
		if (rows.length) return res.status(409).json({ error: 'Username or email already used' });

		const passwordHash = await bcrypt.hash(password, 12);
		const [result] = await pool.execute(
			`INSERT INTO users (first_name, middle_initial, last_name, contact_number, username, email, password_hash)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[firstName || null, middleInitial || null, lastName || null, contactNumber || null, username, email, passwordHash]
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

		// Success - return user info (no password hash)
		return res.status(200).json({ id: user.id, username: user.username, email: user.email });
	} catch (err) {
		console.error('Login error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;
