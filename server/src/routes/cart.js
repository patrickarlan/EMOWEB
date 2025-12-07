const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

// Get all cart items for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await pool.query(
      `SELECT 
        id,
        product_name,
        product_image,
        quantity,
        price,
        added_at
      FROM cart
      WHERE user_id = ?
      ORDER BY added_at DESC`,
      [userId]
    );

    res.json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productName, productImage, quantity, price } = req.body;

    if (!productName || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if item already exists in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_name = ?',
      [userId, productName]
    );

    if (existing.length > 0) {
      // Update quantity if item exists
      const newQuantity = existing[0].quantity + parseInt(quantity);
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );

      res.json({
        success: true,
        message: 'Cart updated successfully',
        itemId: existing[0].id
      });
    } else {
      // Insert new item
      const [result] = await pool.query(
        `INSERT INTO cart (user_id, product_name, product_image, quantity, price) 
        VALUES (?, ?, ?, ?, ?)`,
        [userId, productName, productImage || '', quantity, price]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        itemId: result.insertId
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear entire cart
router.delete('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Checkout - Convert cart to order
router.post('/checkout', requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { paymentMethod, shippingAddress } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.query(
      'SELECT * FROM cart WHERE user_id = ?',
      [userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += parseFloat(item.price) * parseInt(item.quantity);
    }

    const shippingFee = subtotal >= 100 ? 0 : 10;
    const total = subtotal + shippingFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (user_id, order_number, status, payment_method, subtotal, shipping_fee, total, shipping_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, orderNumber, 'pending', paymentMethod, subtotal, shippingFee, total, shippingAddress || '']
    );

    const orderId = orderResult.insertId;

    // Insert order items from cart
    for (const item of cartItems) {
      const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_name, product_image, quantity, price, subtotal) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_name, item.product_image, item.quantity, item.price, itemSubtotal]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: orderId,
        orderNumber,
        total,
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Failed to complete checkout' });
  } finally {
    connection.release();
  }
});

module.exports = router;
