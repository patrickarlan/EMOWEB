const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1 * 1024 * 1024, // 1MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
		}
	}
});

// POST /api/upload/profile-picture - Upload and update profile picture
router.post('/profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
	try {
		const { id } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Check image dimensions
		const metadata = await sharp(req.file.buffer).metadata();
		
		if (metadata.width > 3000 || metadata.height > 3000) {
			return res.status(400).json({ 
				error: 'Image dimensions must not exceed 3000x3000 pixels',
				dimensions: { width: metadata.width, height: metadata.height }
			});
		}

		// Generate unique filename
		const filename = `profile-${id}-${Date.now()}.webp`;
		const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
		const filepath = path.join(uploadDir, filename);

		// Ensure upload directory exists
		await fs.mkdir(uploadDir, { recursive: true });

		// Process and save image (convert to webp for optimization)
		await sharp(req.file.buffer)
			.resize(800, 800, { 
				fit: 'cover', 
				position: 'center' 
			})
			.webp({ quality: 90 })
			.toFile(filepath);

		// Get old profile picture to delete it
		const [oldRows] = await pool.execute(
			'SELECT profile_picture FROM users WHERE id = ?',
			[id]
		);

		// Update database with new profile picture path
		const relativePath = `/uploads/profile-pictures/${filename}`;
		await pool.execute(
			'UPDATE users SET profile_picture = ? WHERE id = ?',
			[relativePath, id]
		);

		// Delete old profile picture if it exists
		if (oldRows.length > 0 && oldRows[0].profile_picture) {
			const oldFilepath = path.join(__dirname, '../..', oldRows[0].profile_picture);
			try {
				await fs.unlink(oldFilepath);
			} catch (err) {
				// Ignore error if file doesn't exist
				console.log('Could not delete old profile picture:', err.message);
			}
		}

		res.json({ 
			message: 'Profile picture updated successfully',
			profilePicture: relativePath
		});
	} catch (err) {
		console.error('Upload profile picture error:', err);
		
		if (err.message.includes('File too large')) {
			return res.status(400).json({ error: 'File size must be less than 1MB' });
		}
		
		if (err.message.includes('Only JPEG, PNG')) {
			return res.status(400).json({ error: err.message });
		}

		res.status(500).json({ error: 'Failed to upload profile picture' });
	}
});

// DELETE /api/upload/profile-picture - Delete profile picture
router.delete('/profile-picture', requireAuth, async (req, res) => {
	try {
		const { id } = req.user || {};
		if (!id) return res.status(401).json({ error: 'Not authenticated' });

		// Get current profile picture
		const [rows] = await pool.execute(
			'SELECT profile_picture FROM users WHERE id = ?',
			[id]
		);

		if (rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		const profilePicture = rows[0].profile_picture;
		
		// Remove profile picture from database
		await pool.execute(
			'UPDATE users SET profile_picture = NULL WHERE id = ?',
			[id]
		);

		// Delete file if it exists
		if (profilePicture) {
			const filepath = path.join(__dirname, '../..', profilePicture);
			try {
				await fs.unlink(filepath);
			} catch (err) {
				console.log('Could not delete profile picture file:', err.message);
			}
		}

		res.json({ message: 'Profile picture deleted successfully' });
	} catch (err) {
		console.error('Delete profile picture error:', err);
		res.status(500).json({ error: 'Failed to delete profile picture' });
	}
});

module.exports = router;
