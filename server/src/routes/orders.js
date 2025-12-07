const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

// Get all orders for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get orders with their items
    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping_fee,
        o.total,
        o.shipping_address,
        o.order_date,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC`,
      [userId]
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT 
            id,
            product_name,
            product_image,
            quantity,
            price,
            subtotal
          FROM order_items
          WHERE order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_method,
        o.subtotal,
        o.shipping_fee,
        o.total,
        o.shipping_address,
        o.order_date,
        o.updated_at
      FROM orders o
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.query(
      `SELECT 
        id,
        product_name,
        product_image,
        quantity,
        price,
        subtotal
      FROM order_items
      WHERE order_id = ?`,
      [orderId]
    );

    res.json({
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create a new order
router.post('/create', requireAuth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { items, paymentMethod, shippingAddress } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    await connection.beginTransaction();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
      subtotal += itemSubtotal;
    }

    // Calculate shipping (free shipping over $100, otherwise $10)
    const shippingFee = subtotal >= 100 ? 0 : 10;
    const total = subtotal + shippingFee;

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (user_id, order_number, status, payment_method, subtotal, shipping_fee, total, shipping_address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, orderNumber, 'pending', paymentMethod, subtotal, shippingFee, total, shippingAddress || '']
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_name, product_image, quantity, price, subtotal) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.productName, item.productImage || '', item.quantity, item.price, itemSubtotal]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        orderNumber,
        total,
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

module.exports = router;
