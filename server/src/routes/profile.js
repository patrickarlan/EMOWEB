const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - Get current user's profile
router.get('/', requireAuth, async (req, res) => {
	try {
		const { id } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		const [rows] = await pool.execute(
			`SELECT 
				id, 
				first_name AS firstName, 
				middle_initial AS middleInitial, 
				last_name AS lastName, 
				contact_number AS contactNumber,
				country_code AS countryCode,
				region,
				country,
				city,
				street_address AS address,
				postal_code AS postalCode,
				username, 
				email,
				profile_picture AS profilePicture,
				created_at AS createdAt 
			FROM users 
			WHERE id = ? 
			LIMIT 1`,
			[id]
		);

		if (!rows.length) return res.status(404).json({ error: 'User not found' });
		return res.json(rows[0]);
	} catch (err) {
		console.error('Get profile error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// PUT /api/profile - Update current user's profile
router.put('/', requireAuth, async (req, res) => {
	try {
		const { id } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		const {
			firstName,
			middleInitial,
			lastName,
			contactNumber,
			countryCode,
			region,
			country,
			city,
			address,
			postalCode
		} = req.body || {};

		await pool.execute(
			`UPDATE users 
			SET 
				first_name = ?,
				middle_initial = ?,
				last_name = ?,
				contact_number = ?,
				country_code = ?,
				region = ?,
				country = ?,
				city = ?,
				street_address = ?,
				postal_code = ?
			WHERE id = ?`,
			[
				firstName || null,
				middleInitial || null,
				lastName || null,
				contactNumber || null,
				countryCode || '+63',
				region || null,
				country || null,
				city || null,
				address || null,
				postalCode || null,
				id
			]
		);

		// Fetch and return updated profile
		const [rows] = await pool.execute(
			`SELECT 
				id, 
				first_name AS firstName, 
				middle_initial AS middleInitial, 
				last_name AS lastName, 
				contact_number AS contactNumber,
				country_code AS countryCode,
				region,
				country,
				city,
				street_address AS address,
				postal_code AS postalCode,
				username, 
				email, 
				created_at AS createdAt 
			FROM users 
			WHERE id = ? 
			LIMIT 1`,
			[id]
		);

		return res.json(rows[0]);
	} catch (err) {
		console.error('Update profile error', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;
