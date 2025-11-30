import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-top">
          <div className="nav-wrapper">
            <nav className="footer-nav">
              <a href="#" className="footer-link">Home</a>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Contact</a>
            </nav>
          </div>
        </div>

        <div className="divider" aria-hidden="true" />

        <div className="footer-bottom">
          <a href="/" className="site-title-footer no-underline" aria-label="EMOWEB">
            <span className="title-base">EMOWEB</span>
          </a>

          <div className="social-links" aria-label="Social links">
            <a href="#" className="social-link" aria-label="Facebook" title="Facebook">
              <i className="bi bi-facebook" aria-hidden="true"></i>
            </a>
            <a href="#" className="social-link" aria-label="Instagram" title="Instagram">
              <i className="bi bi-instagram" aria-hidden="true"></i>
            </a>
            <a href="#" className="social-link" aria-label="TikTok" title="TikTok">
              <i className="bi bi-tiktok" aria-hidden="true"></i>
            </a>
            <a href="#" className="social-link" aria-label="Twitter" title="Twitter">
              <i className="bi bi-twitter" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

