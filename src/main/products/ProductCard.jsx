import React, { useState } from "react";
import "./productCard.scss"; // ensure your css/scss file is linked
import OrderPanel from "./OrderPanel";
import CartPanel from "./CartPanel";
import emoex from "../../pics/EMOEX.png";
import emoex2 from "../../pics/EMOEX2.png";
import emoex3 from "../../pics/EMOEX3.png";
import cartIcon from "../../pics/cart.png";

export default function ProductCard() {
  const [flipped, setFlipped] = useState([false, false, false]);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleInfoClick = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setOrderPanelOpen(true);
  };

  const handleCartClick = (product) => {
    setSelectedProduct(product);
    setCartPanelOpen(true);
  };

  const handleCloseOrder = () => {
    setOrderPanelOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseCart = () => {
    setCartPanelOpen(false);
    setSelectedProduct(null);
  };

  const products = [
    {
      img: emoex,
      title: "LOREM IPSUM",
      desc: "Lorem Ipsum is simply dummy printing and typesetting industry",
      price: "89",
      specs: {
        dimensions: "3.2 x 2.6 x 4.6 cm",
        weight: "100g",
        camera: "Raspi Cam",
        microprocessor: "Raspi 4 8GB R",
        batteryLife: "4 hrs",
        warranty: "1 Year"
      }
    },
    {
      img: emoex2,
      title: "LOREM IPSUM",
      desc: "Lorem Ipsum is simply dummy printing and typesetting industry",
      price: "89",
      specs: {
        dimensions: "3.2 x 2.6 x 4.6 cm",
        weight: "100g",
        camera: "Raspi Cam",
        microprocessor: "Raspi 4 8GB R",
        batteryLife: "4 hrs",
        warranty: "1 Year"
      }
    },
    {
      img: emoex3,
      title: "LOREM IPSUM",
      desc: "Lorem Ipsum is simply dummy printing and typesetting industry",
      price: "89",
      specs: {
        dimensions: "3.2 x 2.6 x 4.6 cm",
        weight: "100g",
        camera: "Raspi Cam",
        microprocessor: "Raspi 4 8GB R",
        batteryLife: "4 hrs",
        warranty: "1 Year"
      }
    }
  ];

  return (
    <main role="main" className="product-root">
      {products.map((product, index) => (
        <div key={index} className="product">
          <div className={`product-flip-container ${flipped[index] ? 'flipped' : ''}`}>
            {/* Front side */}
            <div className="product-panel product-front">
              <figure>
                <img
                  src={product.img}
                  alt={product.title}
                  className="product-image"
                />
              </figure>

              <div className="product-description">
                <div className="info">
                  <h1>{product.title}</h1>
                  <p>{product.desc}</p>
                </div>
                <div className="price">{product.price}</div>
              </div>
            </div>

            {/* Back side - Specs */}
            <div className="product-panel product-back">
              <div className="product-specs">
                <h2>Product Specifications</h2>
                <ul>
                  <li>
                    <span className="spec-label">Size:</span>
                    <span className="spec-value">{product.specs.dimensions}</span>
                  </li>
                  <li>
                    <span className="spec-label">Weight:</span>
                    <span className="spec-value">{product.specs.weight}</span>
                  </li>
                  <li>
                    <span className="spec-label">Camera:</span>
                    <span className="spec-value">{product.specs.camera}</span>
                  </li>
                  <li>
                    <span className="spec-label">Processor :</span>
                    <span className="spec-value">{product.specs.microprocessor}</span>
                  </li>
                  <li>
                    <span className="spec-label">Battery Life:</span>
                    <span className="spec-value">{product.specs.batteryLife}</span>
                  </li>
                  <li>
                    <span className="spec-label">Warranty:</span>
                    <span className="spec-value">{product.specs.warranty}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="product-sidebar">
            <button className="buy" onClick={() => handleBuyClick(product)}>
              <span>BUY ITEM</span>
            </button>

            <button className="info" onClick={() => handleInfoClick(index)}>
              <span>MORE INFO</span>
            </button>

            <button className="cart" onClick={() => handleCartClick(product)}>
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      ))}
      
      {orderPanelOpen && selectedProduct && (
        <OrderPanel 
          product={selectedProduct} 
          onClose={handleCloseOrder}
        />
      )}

      {cartPanelOpen && selectedProduct && (
        <CartPanel 
          product={selectedProduct} 
          onClose={handleCloseCart}
        />
      )}
    </main>
  );
}
