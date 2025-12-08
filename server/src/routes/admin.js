const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const db = require('../db');
const bcrypt = require('bcrypt');

// Create new user
router.post('/users', requireAdmin, async (req, res) => {
    try {
        const {
            firstName,
            middleInitial,
            lastName,
            username,
            email,
            password,
            contactNumber,
            countryCode,
            region,
            country,
            city,
            address,
            postalCode,
            role
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, username, email, and password are required'
            });
        }

        // Validate role
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        // Check if username already exists
        const [existingUsername] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        if (existingUsername.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const [existingEmail] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.query(
            `INSERT INTO users (
                first_name,
                middle_initial,
                last_name,
                username,
                email,
                password_hash,
                contact_number,
                country_code,
                region,
                country,
                city,
                street_address,
                postal_code,
                role,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                firstName,
                middleInitial || null,
                lastName,
                username,
                email,
                passwordHash,
                contactNumber || null,
                countryCode || null,
                region || null,
                country || null,
                city || null,
                address || null,
                postalCode || null,
                role || 'user'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT 
                id, 
                first_name, 
                middle_initial, 
                last_name, 
                username, 
                email, 
                contact_number, 
                country_code,
                region,
                country,
                city,
                street_address,
                postal_code,
                role, 
                is_active, 
                created_at 
            FROM users 
            ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Get deleted users (must come before /users/:id to avoid matching 'deleted' as an id)
router.get('/users/deleted', requireAdmin, async (req, res) => {
    try {
        const [deletedUsers] = await db.query(
            `SELECT 
                id,
                original_id,
                username,
                email,
                contact_number,
                role,
                deleted_at,
                deleted_by
            FROM deleted_users 
            ORDER BY deleted_at DESC`
        );

        res.json({
            success: true,
            users: deletedUsers
        });
    } catch (error) {
        console.error('Error fetching deleted users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch deleted users'
        });
    }
});

// Get single user by ID
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT 
                id, 
                first_name, 
                middle_initial, 
                last_name, 
                username, 
                email, 
                contact_number,
                country_code,
                region,
                country,
                city,
                street_address,
                postal_code, 
                role, 
                is_active, 
                created_at 
            FROM users 
            WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// Update user
router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            middleInitial,
            lastName,
            username,
            email,
            contactNumber,
            countryCode,
            region,
            country,
            city,
            address,
            postalCode,
            role
        } = req.body;

        // Validate role
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        // Check if user exists
        const [existingUser] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if username is taken by another user
        if (username) {
            const [duplicateUsername] = await db.query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, id]
            );
            if (duplicateUsername.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
        }

        // Check if email is taken by another user
        if (email) {
            const [duplicateEmail] = await db.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );
            if (duplicateEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
        }

        // Update user
        await db.query(
            `UPDATE users 
            SET first_name = ?, 
                middle_initial = ?, 
                last_name = ?, 
                username = ?, 
                email = ?, 
                contact_number = ?,
                country_code = ?,
                region = ?,
                country = ?,
                city = ?,
                street_address = ?,
                postal_code = ?,
                role = ?
            WHERE id = ?`,
            [
                firstName,
                middleInitial || null,
                lastName,
                username,
                email,
                contactNumber,
                countryCode || null,
                region || null,
                country || null,
                city || null,
                address || null,
                postalCode || null,
                role,
                id
            ]
        );

        // Fetch updated user
        const [updatedUser] = await db.query(
            `SELECT 
                id, 
                first_name, 
                middle_initial, 
                last_name, 
                username, 
                email, 
                contact_number,
                country_code,
                region,
                country,
                city,
                street_address,
                postal_code,
                role, 
                is_active 
            FROM users 
            WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Soft delete user (move to deleted_users table)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.isSuperAdmin ? 'super-admin' : req.user.id;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Prevent admin from deleting themselves
        if (user.id === adminId && !req.user.isSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // Copy user to deleted_users table
        await db.query(
            `INSERT INTO deleted_users (
                original_id,
                first_name,
                middle_initial,
                last_name,
                username,
                email,
                password_hash,
                contact_number,
                country_code,
                region,
                country,
                city,
                street_address,
                postal_code,
                role,
                was_active,
                original_created_at,
                deleted_by,
                deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                user.id,
                user.first_name,
                user.middle_initial,
                user.last_name,
                user.username,
                user.email,
                user.password_hash,
                user.contact_number,
                user.country_code,
                user.region,
                user.country,
                user.city,
                user.street_address,
                user.postal_code,
                user.role,
                user.is_active,
                user.created_at,
                adminId
            ]
        );

        // Delete user from users table
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// Toggle user active status
router.put('/users/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.isSuperAdmin ? 'super-admin' : req.user.id;

        // Check if user exists
        const [users] = await db.query('SELECT id, is_active FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deactivating themselves
        if (users[0].id === adminId && !req.user.isSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const newStatus = !users[0].is_active;

        // Toggle status
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

        res.json({
            success: true,
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            isActive: newStatus
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status'
        });
    }
});

module.exports = router;
