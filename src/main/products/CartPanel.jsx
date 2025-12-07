import React, { useState } from "react";
import "./cartPanel.scss";

export default function CartPanel({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Handle add to cart logic here
    console.log({
      product: product.title,
      quantity,
      total: product.price * quantity
    });
    onClose();
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <>
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
