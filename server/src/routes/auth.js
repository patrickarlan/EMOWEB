const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Super Admin credentials from environment
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@emoweb.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecureAdmin123!';

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
			`INSERT INTO users (first_name, middle_initial, last_name, contact_number, region, country, city, street_address, postal_code, username, email, password_hash, role)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[firstName || null, middleInitial || null, lastName || null, contactNumber || null, region || null, country || null, city || null, address || null, postalCode || null, username, email, passwordHash, 'user']
		);

		return res.status(201).json({ id: result.insertId });
	} catch (err) {
		console.error('Register error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
	const { username, password, rememberMe } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

	try {
		// Check if this is the super admin
		if ((username === SUPER_ADMIN_USERNAME || username === SUPER_ADMIN_EMAIL) && password === SUPER_ADMIN_PASSWORD) {
			// Super admin login - no database check
			const expiresIn = rememberMe ? '30d' : '7d';
			const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
			
			const token = jwt.sign({ 
				id: 'super-admin', 
				username: SUPER_ADMIN_USERNAME, 
				email: SUPER_ADMIN_EMAIL,
				isSuperAdmin: true,
				role: 'super_admin'
			}, JWT_SECRET, { expiresIn });

			res.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
				maxAge,
			});

			return res.status(200).json({ 
				id: 'super-admin', 
				username: SUPER_ADMIN_USERNAME, 
				email: SUPER_ADMIN_EMAIL,
				role: 'super_admin'
			});
		}

		// Regular user login
		const [rows] = await pool.execute('SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ? LIMIT 1', [username, username]);
		if (!rows.length) return res.status(401).json({ error: 'Invalid username or password' });

		const user = rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) return res.status(401).json({ error: 'Invalid username or password' });

		// Success - sign JWT and set as HttpOnly cookie
		// If rememberMe is checked, token expires in 30 days, otherwise 7 days
		const expiresIn = rememberMe ? '30d' : '7d';
		const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
		
		const token = jwt.sign({ 
			id: user.id, 
			username: user.username, 
			email: user.email,
			isSuperAdmin: false,
			role: user.role || 'user'
		}, JWT_SECRET, { expiresIn });

		// set cookie (HttpOnly, secure in production)
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
			maxAge,
		});

		return res.status(200).json({ id: user.id, username: user.username, email: user.email, role: user.role || 'user' });
	} catch (err) {
		console.error('Login error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// GET /api/auth/me - returns current user if authenticated
router.get('/me', requireAuth, async (req, res) => {
	try {
		const { id, isSuperAdmin, username, email } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		// Handle super admin (no database lookup)
		if (isSuperAdmin && id === 'super-admin') {
			return res.json({
				id: 'super-admin',
				username: username || SUPER_ADMIN_USERNAME,
				email: email || SUPER_ADMIN_EMAIL,
				firstName: 'Super',
				lastName: 'Admin',
				role: 'super_admin',
				isSuperAdmin: true,
				createdAt: new Date().toISOString()
			});
		}

		// Regular user lookup
		const [rows] = await pool.execute('SELECT id, first_name AS firstName, middle_initial AS middleInitial, last_name AS lastName, contact_number AS contactNumber, profile_picture AS profilePicture, username, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1', [id]);
		if (!rows.length) return res.status(404).json({ error: 'User not found' });
		return res.json({ ...rows[0], isSuperAdmin: false });
	} catch (err) {
		console.error('Me error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/auth/verify-password - verify user's current password
router.post('/verify-password', requireAuth, async (req, res) => {
	try {
		const { password } = req.body || {};
		const { id, isSuperAdmin } = req.user || {};

		if (!password) {
			return res.status(400).json({ message: 'Password is required' });
		}

		if (!id) {
			return res.status(401).json({ message: 'Not authenticated' });
		}

		// Handle super admin password verification
		if (isSuperAdmin && id === 'super-admin') {
			const isValid = password === SUPER_ADMIN_PASSWORD;
			if (!isValid) {
				return res.status(401).json({ message: 'Incorrect password' });
			}
			return res.json({ verified: true, message: 'Password verified successfully' });
		}

		// Fetch user's password hash
		const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [id]);
		
		if (!rows.length) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Compare provided password with stored hash
		const isValid = await bcrypt.compare(password, rows[0].password_hash);

		if (!isValid) {
			return res.status(401).json({ message: 'Incorrect password' });
		}

		return res.json({ verified: true, message: 'Password verified successfully' });
	} catch (err) {
		console.error('Password verification error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// POST /api/auth/logout - clears auth cookie
router.post('/logout', (req, res) => {
	res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' });
	return res.json({ ok: true });
});

module.exports = router;

