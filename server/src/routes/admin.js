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
            role,
            newPassword
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

        // Hash password if provided
        let hashedPassword = null;
        if (newPassword && newPassword.trim() !== '') {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        // Update user - conditionally update password
        if (hashedPassword) {
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
                    role = ?,
                    password_hash = ?
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
                    hashedPassword,
                    id
                ]
            );
        } else {
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
        }

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

        // Toggle status - when admin deactivates, clear deactivated_until to distinguish from user deactivation
        if (newStatus === 0 || newStatus === false) {
            // Deactivating - clear deactivated_until
            await db.query('UPDATE users SET is_active = ?, deactivated_until = NULL WHERE id = ?', [newStatus, id]);
        } else {
            // Activating - just set is_active
            await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
        }

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

// ==================== PRODUCT MANAGEMENT ROUTES ====================

// Get all products
router.get('/products', requireAdmin, async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM products ORDER BY created_at DESC'
        );
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/products/:id', requireAdmin, async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Update product
router.put('/products/:id', requireAdmin, async (req, res) => {
    const { product_name, description, price, stock_quantity, is_active } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE products 
             SET product_name = ?, description = ?, price = ?, stock_quantity = ?, is_active = ?
             WHERE id = ?`,
            [product_name, description, price, stock_quantity, is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Toggle product active status
router.patch('/products/:id/toggle-active', requireAdmin, async (req, res) => {
    const { is_active } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE products SET is_active = ? WHERE id = ?',
            [is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product status updated successfully' });
    } catch (error) {
        console.error('Toggle product error:', error);
        res.status(500).json({ error: 'Failed to update product status' });
    }
});

// Soft delete product (move to deleted_products table)
router.delete('/products/:id', requireAdmin, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Get product details
        const [products] = await connection.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );

        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];
        const adminUsername = req.user.isSuperAdmin ? 'Super Admin' : req.user.username;

        // Insert into deleted_products
        await connection.query(
            `INSERT INTO deleted_products 
             (id, product_name, product_image, description, price, stock_quantity, 
              specifications, is_active, original_created_at, original_updated_at, deleted_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product.id,
                product.product_name,
                product.product_image,
                product.description,
                product.price,
                product.stock_quantity,
                JSON.stringify(product.specifications),
                product.is_active,
                product.created_at,
                product.updated_at,
                adminUsername
            ]
        );

        // Delete from products
        await connection.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        await connection.commit();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    } finally {
        connection.release();
    }
});

// Get deleted products
router.get('/deleted-products', requireAdmin, async (req, res) => {
    try {
        const [deletedProducts] = await db.query(
            'SELECT * FROM deleted_products ORDER BY deleted_at DESC'
        );
        res.json(deletedProducts);
    } catch (error) {
        console.error('Get deleted products error:', error);
        res.status(500).json({ error: 'Failed to fetch deleted products' });
    }
});

// ==================== ORDER MANAGEMENT ROUTES ====================

// Get all orders with user and product details
router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT 
                o.id,
                o.user_id,
                o.order_number,
                o.status,
                o.payment_method,
                o.total,
                o.order_date,
                u.username,
                u.email,
                GROUP_CONCAT(oi.product_name SEPARATOR ', ') as products,
                SUM(oi.quantity) as total_quantity
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN order_items oi ON o.id = oi.order_id`;
        
        const params = [];
        if (status) {
            query += ` WHERE o.status = ?`;
            params.push(status);
        }
        
        query += ` GROUP BY o.id ORDER BY o.order_date DESC`;
        
        const [orders] = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        // Get current order status
        const [orderRows] = await db.query(
            'SELECT status FROM orders WHERE id = ?',
            [req.params.id]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const currentStatus = orderRows[0].status;
        console.log(`Order ${req.params.id}: Current status = ${currentStatus}, New status = ${status}`);

        // Update order status
        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        // If status changed to 'shipped', decrement stock
        if (status === 'shipped' && currentStatus !== 'shipped') {
            console.log(`Status changed to shipped for order ${req.params.id}, checking items...`);
            
            // Get all order items
            const [items] = await db.query(
                `SELECT product_id, quantity, product_name 
                 FROM order_items 
                 WHERE order_id = ?`,
                [req.params.id]
            );

            console.log(`Found ${items.length} items:`, items);

            // Decrement stock for each product
            for (const item of items) {
                let productId = item.product_id;
                
                // If product_id is null, try to find it by product_name
                if (!productId && item.product_name) {
                    console.log(`No product_id for item, looking up by name: ${item.product_name}`);
                    const [products] = await db.query(
                        'SELECT id FROM products WHERE product_name = ? LIMIT 1',
                        [item.product_name]
                    );
                    if (products.length > 0) {
                        productId = products[0].id;
                        // Update the order_item with the product_id for future use
                        await db.query(
                            'UPDATE order_items SET product_id = ? WHERE order_id = ? AND product_name = ?',
                            [productId, req.params.id, item.product_name]
                        );
                        console.log(`Updated order_item with product_id: ${productId}`);
                    }
                }
                
                if (productId) {
                    const [updateResult] = await db.query(
                        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
                        [item.quantity, productId, item.quantity]
                    );
                    
                    console.log(`Stock decrement for product ${item.product_name} (ID: ${productId}): -${item.quantity}, Rows affected: ${updateResult.affectedRows}`);
                } else {
                    console.log(`Could not find product_id for: ${item.product_name}, skipping stock decrement`);
                }
            }
        } else {
            console.log(`Skipping stock decrement: status=${status}, currentStatus=${currentStatus}`);
        }

        res.json({ 
            message: 'Order status updated successfully',
            stockUpdated: status === 'shipped' && currentStatus !== 'shipped'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get orders by product ID
router.get('/products/:id/orders', requireAdmin, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT 
                o.id,
                o.order_number,
                oi.quantity,
                oi.subtotal,
                o.status,
                o.order_date,
                u.username,
                u.email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE oi.product_name = (SELECT product_name FROM products WHERE id = ?)
             ORDER BY o.order_date DESC`,
            [req.params.id]
        );
        res.json(orders);
    } catch (error) {
        console.error('Get product orders error:', error);
        res.status(500).json({ error: 'Failed to fetch product orders' });
    }
});

// Get orders by user ID
router.get('/users/:id/orders', requireAdmin, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT 
                o.id,
                o.user_id,
                o.order_number,
                o.status,
                o.payment_method,
                o.total,
                o.order_date,
                GROUP_CONCAT(oi.product_name SEPARATOR ', ') as products,
                SUM(oi.quantity) as total_quantity
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.order_date DESC`,
            [req.params.id]
        );
        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

module.exports = router;
