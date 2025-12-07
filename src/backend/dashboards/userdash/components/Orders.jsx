import React, { useState, useEffect } from 'react';
import './styles/Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      processing: '#60a5fa',
      shipped: '#a78bfa',
      delivered: '#34d399',
      cancelled: '#f87171'
    };
    return colors[status] || '#9ca3af';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">
          <p>Error loading orders: {error}</p>
          <button onClick={fetchOrders} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>Your order history will appear here once you make a purchase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2 className="orders-title">My Orders</h2>
        <p className="orders-subtitle">Track and manage your orders</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-number">Order #{order.order_number}</span>
                <span className="order-date">{formatDate(order.order_date)}</span>
              </div>
              <span 
                className="order-status"
                style={{ 
                  backgroundColor: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status),
                  border: `1px solid ${getStatusColor(order.status)}40`
                }}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image-wrapper">
                    {item.product_image ? (
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="item-image"
                      />
                    ) : (
                      <div className="item-image-placeholder">
                        <span>📦</span>
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4 className="item-name">{item.product_name}</h4>
                    <div className="item-meta">
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      <span className="item-price">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                  <div className="item-subtotal">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-payment">
                <span className="payment-label">Payment Method:</span>
                <span className="payment-method">{order.payment_method}</span>
              </div>
              <div className="order-total-section">
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">{formatPrice(order.subtotal)}</span>
                </div>
                {order.shipping_fee > 0 && (
                  <div className="total-row">
                    <span className="total-label">Shipping:</span>
                    <span className="total-value">{formatPrice(order.shipping_fee)}</span>
                  </div>
                )}
                <div className="total-row total-final">
                  <span className="total-label">Total:</span>
                  <span className="total-value">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
