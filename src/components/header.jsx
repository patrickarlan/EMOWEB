import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../pics/emoweb.png";
import emoex from '../pics/EMOEX.png';
import emoex2 from '../pics/EMOEX2.png';
import emoex3 from '../pics/EMOEX3.png';
import "../styles/header.css";


export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const products = [
    {
      id: 'emo-s',
      img: emoex,
      title: 'EMO-S AI ROBOT',
      desc: 'Lorem Ipsum is simply dummy printing and typesetting industry',
      price: '67'
    },
    {
      id: 'emo-prototype',
      img: emoex2,
      title: 'EMO AI PROTOTYPE',
      desc: 'Lorem Ipsum is simply dummy printing and typesetting industry',
      price: '40'
    },
    {
      id: 'emo-pro',
      img: emoex3,
      title: 'EMO AI PRO',
      desc: 'Lorem Ipsum is simply dummy printing and typesetting industry',
      price: '95'
    }
  ];
  
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const threshold = 1; // become sticky as soon as user starts scrolling

    const onScroll = () => {
      const scrolled = window.scrollY || window.pageYOffset;
      setIsSticky(scrolled > threshold);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // run once to set initial state
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';
  const profilePicture = user?.profilePicture ? `http://localhost:4000${user.profilePicture}` : null;

  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.desc.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleProductClick = (productId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate('/products');
    
    setTimeout(() => {
      const productElements = document.querySelectorAll('.product');
      const productIndex = products.findIndex(p => p.id === productId);
      if (productElements[productIndex]) {
        productElements[productIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        productElements[productIndex].classList.add('highlight-product');
        setTimeout(() => {
          productElements[productIndex].classList.remove('highlight-product');
        }, 2000);
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredProducts(products);
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && showSearchDropdown) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showSearchDropdown]);

  useEffect(() => {
    setFilteredProducts(products);
  }, []);

  return (
    <header ref={headerRef} className={"site-header backdrop-blur-sm" + (isSticky ? " sticky" : "")}>
      
      <div className="header-logo">
        <Link to="/" className="site-nav no-underline flex items-center"> <img src={logo} alt="EMOWEB Logo" className="logo-image"/>
        <h1 className="site-title">EMOWEB</h1>
        </Link>  
      </div>
      
      <div className="site-container backdrop-blur-sm">
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
      </div>

      <div className="header-controls" role="group" aria-label="Header controls">
        <div className="search-container" ref={searchContainerRef}>
          <div className="search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon-input">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="search-input-field"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={handleClearSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {showSearchDropdown && (
            <div className="search-dropdown">
              {filteredProducts.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    {searchQuery ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''} found` : 'All Products'}
                  </div>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img src={product.img} alt={product.title} className="search-result-img" />
                      <div className="search-result-info">
                        <h4 className="search-result-title">{product.title}</h4>
                        <p className="search-result-desc">{product.desc}</p>
                        <span className="search-result-price">${product.price}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-no-results">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p>No products found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="search-button-mobile" aria-label="Search" onClick={handleSearchFocus}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        <Link to="/products" className="cart-button" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </Link>
        
        {user ? (
          <Link to="/userdash" className="profile-button profile-button-logged" aria-label="User profile">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-button-img" />
            ) : (
              <span className="profile-button-letter">{avatarLetter}</span>
            )}
          </Link>
        ) : (
          <Link to="/signform" className="profile-button" aria-label="User profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
