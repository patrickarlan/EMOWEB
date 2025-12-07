import React, { useState, useEffect } from 'react';
import './styles/Cart.css';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update local state
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setCartItems(items => items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod,
          shippingAddress: ''
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to checkout');
      }

      const result = await response.json();
      alert('Order placed successfully! Order #' + result.order.orderNumber);
      setCartItems([]);
      setShowCheckout(false);
      window.location.href = '/userdash';
    } catch (err) {
      alert(err.message || 'Failed to complete checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 100 ? 0 : 10;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="cart-error">
          <p>Error loading cart: {error}</p>
          <button onClick={fetchCart} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some products to your cart to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Shopping Cart</h2>
        <p className="cart-subtitle">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image-wrapper">
                {item.product_image ? (
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-item-image-placeholder">
                    <span>📦</span>
                  </div>
                )}
              </div>

              <div className="cart-item-details">
                <h4 className="cart-item-name">{item.product_name}</h4>
                <p className="cart-item-price">{formatPrice(item.price)} each</p>
                
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <div className="cart-item-subtotal">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button 
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
            </div>
            
            {calculateSubtotal() < 100 && (
              <p className="shipping-note">Free shipping on orders over $100</p>
            )}
            
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>

            {!showCheckout ? (
              <button 
                className="checkout-button"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="checkout-section">
                <h4 className="checkout-title">Payment Method</h4>
                <div className="payment-methods">
                  {['Cash on Delivery', 'Credit Card', 'GCash', 'PayPal'].map(method => (
                    <label key={method} className={`payment-option ${paymentMethod === method ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
                <button 
                  className="place-order-button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Place Order'}
                </button>
                <button 
                  className="cancel-checkout-button"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
