import React, { useState, useEffect } from "react";
import "./productCard.scss"; // ensure your css/scss file is linked
import OrderPanel from "./OrderPanel";
import CartPanel from "./CartPanel";
import Notification from "../../components/Notification";
import emoex from "../../pics/EMOEX.png";
import emoex2 from "../../pics/EMOEX2.png";
import emoex3 from "../../pics/EMOEX3.png";
import cartIcon from "../../pics/cart.png";

export default function ProductCard() {
  const [flipped, setFlipped] = useState([false, false, false]);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default product images mapping
  const productImages = {
    "EMO-S AI ROBOT": emoex,
    "EMO AI PROTOTYPE": emoex2,
    "EMO AI PRO": emoex3
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      // Map database products to include images and parse specifications
      const mappedProducts = data
        .filter(product => product.is_active) // Only show active products
        .map(product => ({
          id: product.id,
          img: productImages[product.product_name] || emoex,
          title: product.product_name,
          desc: product.description,
          price: product.price,
          stock: product.stock_quantity,
          specs: typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications) 
            : product.specifications
        }));
      
      setProducts(mappedProducts);
      setFlipped(new Array(mappedProducts.length).fill(false));
    } catch (error) {
      console.error('Fetch products error:', error);
      setNotification({ 
        message: 'Failed to load products', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInfoClick = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const checkAuthAndProceed = async (action, product) => {
    try {
      const authCheck = await fetch('/api/auth/me', { credentials: 'include' });
      if (!authCheck.ok) {
        // User not logged in - show notification and redirect
        setNotification({ 
          message: 'Please sign in to continue', 
          type: 'info' 
        });
        setTimeout(() => {
          window.location.href = '/signform';
        }, 2000);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setNotification({ 
        message: 'Please sign in to continue', 
        type: 'info' 
      });
      setTimeout(() => {
        window.location.href = '/signform';
      }, 2000);
      return false;
    }
  };

  const handleBuyClick = async (product) => {
    const isAuthenticated = await checkAuthAndProceed('order', product);
    if (isAuthenticated) {
      setSelectedProduct(product);
      setOrderPanelOpen(true);
    }
  };

  const handleCartClick = async (product) => {
    const isAuthenticated = await checkAuthAndProceed('cart', product);
    if (isAuthenticated) {
      setSelectedProduct(product);
      setCartPanelOpen(true);
    }
  };

  const handleCloseOrder = () => {
    setOrderPanelOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseCart = () => {
    setCartPanelOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <main role="main" className="product-root">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
          Loading products...
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main role="main" className="product-root">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
          No products available at the moment.
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="product-root">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
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
                <div className="price" data-length={Math.floor(product.price).toString().length}>
                  <span className="price-whole">{Math.floor(product.price)}</span>
                  <span className="price-decimal" style={{fontSize: '0.4em'}}>.{(product.price % 1).toFixed(2).substring(2)}</span>
                </div>
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
                  <li>
                    <span className="spec-label">Stock:</span>
                    <span className={`spec-value ${product.stock <= 10 ? 'low-stock' : ''}`}>
                      {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                    </span>
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
