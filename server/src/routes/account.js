const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// PUT /api/account/change-password - Change user password
router.put('/change-password', requireAuth, async (req, res) => {
	try {
		const { id, isSuperAdmin } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		// Super admin cannot change password through this endpoint
		if (isSuperAdmin && id === 'super-admin') {
			return res.status(403).json({ 
				error: 'Super admin password cannot be changed',
				message: 'Super admin password must be changed in the .env file on the server.'
			});
		}

		const { oldPassword, newPassword } = req.body;

		if (!oldPassword || !newPassword) {
			return res.status(400).json({ error: 'Old password and new password are required' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ error: 'New password must be at least 6 characters' });
		}

		// Get current password hash
		const [rows] = await pool.execute(
			'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
			[id]
		);

		if (!rows.length) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Verify old password
		const match = await bcrypt.compare(oldPassword, rows[0].password_hash);
		if (!match) {
			return res.status(401).json({ error: 'Current password is incorrect' });
		}

		// Hash new password
		const newPasswordHash = await bcrypt.hash(newPassword, 12);

		// Update password
		await pool.execute(
			'UPDATE users SET password_hash = ? WHERE id = ?',
			[newPasswordHash, id]
		);

		return res.json({ message: 'Password changed successfully' });
	} catch (err) {
		console.error('Change password error:', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

// POST /api/account/deactivate - Deactivate user account temporarily
router.post('/deactivate', requireAuth, async (req, res) => {
	try {
		const { id, isSuperAdmin } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		// Super admin cannot be deactivated
		if (isSuperAdmin && id === 'super-admin') {
			return res.status(403).json({ 
				error: 'Super admin account cannot be deactivated',
				message: 'Super admin is a protected system account.'
			});
		}

		const { days } = req.body;

		if (!days || days < 1 || days > 14) {
			return res.status(400).json({ error: 'Deactivation period must be between 1 and 14 days' });
		}

		// Calculate reactivation date
		const deactivatedUntil = new Date();
		deactivatedUntil.setDate(deactivatedUntil.getDate() + days);

		// Update user status
		await pool.execute(
			'UPDATE users SET is_active = 0, deactivated_until = ? WHERE id = ?',
			[deactivatedUntil, id]
		);

		// Clear the authentication cookie to log out the user
		res.clearCookie('token', { 
			httpOnly: true, 
			secure: process.env.NODE_ENV === 'production', 
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' 
		});

		return res.json({ 
			message: 'Account deactivated successfully',
			deactivatedUntil: deactivatedUntil.toISOString()
		});
	} catch (err) {
		console.error('Deactivate account error:', err);
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;
