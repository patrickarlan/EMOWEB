const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/products - Public endpoint to get all active products
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, product_name, product_image, description, price, stock_quantity, specifications, is_active 
             FROM products 
             WHERE is_active = 1 
             ORDER BY id ASC`
        );
        
        return res.json(rows);
    } catch (err) {
        console.error('Fetch products error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/products/:id - Public endpoint to get a specific product
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            `SELECT id, product_name, product_image, description, price, stock_quantity, specifications, is_active 
             FROM products 
             WHERE id = ? AND is_active = 1 
             LIMIT 1`,
            [id]
        );
        
        if (!rows.length) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        return res.json(rows[0]);
    } catch (err) {
        console.error('Fetch product error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
