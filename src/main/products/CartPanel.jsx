import React, { useState } from "react";
import Notification from "../../components/Notification";
import "./cartPanel.scss";

export default function CartPanel({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(null);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productName: product.title,
          productImage: product.img,
          quantity: quantity,
          price: product.price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      setNotification({ message: 'Item added to cart successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Cart error:', err);
      setNotification({ message: 'Failed to add item to cart', type: 'error' });
    }
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="cart-overlay" onClick={onClose}></div>
      <div className="cart-panel">
        <button className="cart-close" onClick={onClose}>×</button>
        
        <div className="cart-content">
          <div className="cart-left">
            <img src={product.img} alt={product.title} className="cart-image" />
          </div>

          <div className="cart-right">
            <h2 className="cart-title">{product.title}</h2>
            
            <div className="cart-section">
              <label className="cart-label">Quantity</label>
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

            <div className="cart-summary">
              <div className="summary-row">
                <span>Unit Price:</span>
                <span>${product.price}</span>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <span>× {quantity}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <button className="cart-submit-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
