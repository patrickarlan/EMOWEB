import React, { useState } from "react";
import "./orderPanel.scss";

export default function OrderPanel({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleOrder = () => {
    // Handle order submission logic here
    console.log({
      product: product.title,
      quantity,
      paymentMethod,
      total: product.price * quantity
    });
    onClose();
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <>
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
                <label className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Card</span>
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
              <div className="summary-row total">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <button className="order-submit-btn" onClick={handleOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
