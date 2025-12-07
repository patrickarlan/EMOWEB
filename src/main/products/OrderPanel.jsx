import React, { useState } from "react";
import Notification from "../../components/Notification";
import "./orderPanel.scss";

export default function OrderPanel({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = {
        items: [
          {
            productName: product.title,
            productImage: product.img,
            quantity: quantity,
            price: product.price
          }
        ],
        paymentMethod: paymentMethod,
        shippingAddress: '' // You can add a form field for this later
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server error. Please make sure the server is running.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      console.log('Order created:', result);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Optionally redirect to orders page
        window.location.href = '/userdash';
      }, 2000);

    } catch (err) {
      console.error('Order error:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  if (success) {
    return (
      <>
        <div className="order-overlay" onClick={onClose}></div>
        <div className="order-panel">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="order-overlay" onClick={onClose}></div>
      <div className="order-panel">
        <button className="order-close" onClick={onClose}>×</button>
        
        <div className="order-content">
          <div className="order-left">
            <img src={product.img} alt={product.title} className="order-image" />
          </div>

          <div className="order-right">
            <h2 className="order-title">{product.title}</h2>
            
            <div className="order-section">
              <label className="order-label">Quantity</label>
              <div className="quantity-control">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="order-section">
              <label className="order-label">Payment Method</label>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'Credit Card' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Credit Card"
                    checked={paymentMethod === 'Credit Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit Card</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'GCash' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="GCash"
                    checked={paymentMethod === 'GCash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>GCash</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'PayPal' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="PayPal"
                    checked={paymentMethod === 'PayPal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>PayPal</span>
                </label>
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Unit Price:</span>
                <span>${product.price}</span>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <span>× {quantity}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${(product.price * quantity >= 100) ? '0.00' : '10.00'}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${((product.price * quantity) + (product.price * quantity >= 100 ? 0 : 10)).toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="order-error">
                {error}
              </div>
            )}

            <button 
              className="order-submit-btn" 
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
