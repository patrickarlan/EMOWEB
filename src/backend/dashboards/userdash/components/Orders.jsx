import React, { useState, useEffect } from 'react';
import './styles/Orders.css';
import Notification from '../../../../components/Notification';

export default function Orders({ onOrderCancelled, filterStatus = 'active' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState(null);

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery time too long',
    'Product not needed anymore',
    'Other (please specify)'
  ];

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

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCustomReason('');
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      setNotification({ message: 'Please select a reason for cancellation', type: 'error' });
      return;
    }

    if (cancelReason === 'Other (please specify)' && !customReason.trim()) {
      setNotification({ message: 'Please specify your reason', type: 'error' });
      return;
    }

    try {
      setCancelling(true);
      const finalReason = cancelReason === 'Other (please specify)' ? customReason : cancelReason;

      const response = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason: finalReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setNotification({ message: 'Order cancelled successfully', type: 'success' });
      setShowCancelModal(false);
      fetchOrders(); // Refresh orders
      
      // Switch to cancelled orders tab after a short delay
      if (onOrderCancelled) {
        setTimeout(() => {
          onOrderCancelled();
        }, 1500);
      }
    } catch (err) {
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = (status) => {
    return ['pending', 'processing'].includes(status);
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
    return `$${Number(price).toLocaleString('en-US', {
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

  // Filter orders based on the filterStatus prop
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'active') {
      // Active orders: pending, processing, shipped
      return ['pending', 'processing', 'shipped'].includes(order.status);
    } else if (filterStatus === 'delivered') {
      return order.status === 'delivered';
    }
    return true; // Should not reach here as cancelled orders use different component
  });

  if (filteredOrders.length === 0) {
    const emptyMessages = {
      active: 'No active orders at the moment.',
      delivered: 'No delivered orders yet.'
    };
    
    return (
      <div className="orders-container">
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h3>No {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Orders</h3>
          <p>{emptyMessages[filterStatus] || 'No orders found.'}</p>
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
        {filteredOrders.map((order) => (
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

            {canCancelOrder(order.status) && (
              <div className="order-actions">
                <button 
                  className="cancel-order-btn"
                  onClick={() => handleCancelClick(order)}
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCancelModal && (
        <div className="cancel-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cancel-modal-close" onClick={() => setShowCancelModal(false)}>
              ×
            </button>
            
            <h3 className="cancel-modal-title">Cancel Order</h3>
            <p className="cancel-modal-subtitle">Order #{selectedOrder?.order_number}</p>
            
            <div className="cancel-reason-section">
              <label className="cancel-reason-label">Please tell us why you're cancelling:</label>
              
              <div className="cancel-reasons-list">
                {cancelReasons.map((reason) => (
                  <label key={reason} className="cancel-reason-option">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other (please specify)' && (
                <textarea
                  className="cancel-custom-reason"
                  placeholder="Please specify your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows="3"
                />
              )}
            </div>

            <div className="cancel-modal-actions">
              <button 
                className="cancel-modal-btn cancel-modal-btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button 
                className="cancel-modal-btn cancel-modal-btn-danger"
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
