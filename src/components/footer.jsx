import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">

        <div className="footer-top">
          <div className="footer-top-left">
            <Link to="/terms" className="button-link no-underline edge-left">
              <p className="label-button"><span className="text-span-19">Terms</span></p>
            </Link>
          </div>

          <div className="footer-top-center">
            <nav className="footer-nav" aria-label="Footer navigation">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </nav>
          </div>

          <div className="footer-top-right">
            <Link to="/privacy" className="button-link no-underline edge-right">
              <p className="label-button"><span className="text-span-19">Privacy</span></p>
            </Link>
          </div>
        </div>

        <div className="divider" aria-hidden="true" />

        <div className="footer-bottom">
          <Link to="/" className="site-title-footer no-underline" aria-label="EMOWEB">
            <span className="title-base">EMOWEB</span>
          </Link>

          <div className="social-container" aria-label="Social links">
            <Link to="#" className="social-link" aria-label="Facebook" title="Facebook">
              <i className="bi bi-facebook" aria-hidden="true"></i>
            </Link>
            <Link to="#" className="social-link" aria-label="Instagram" title="Instagram">
              <i className="bi bi-instagram" aria-hidden="true"></i>
            </Link>
            <Link to="#" className="social-link" aria-label="TikTok" title="TikTok">
              <i className="bi bi-tiktok" aria-hidden="true"></i>
            </Link>
            <Link to="#" className="social-link" aria-label="Twitter" title="Twitter">
              <i className="bi bi-twitter" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

