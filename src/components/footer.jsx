import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <h1 className="site-title">EMOWEB</h1>
        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Home</a>
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900">About</a>
          <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
