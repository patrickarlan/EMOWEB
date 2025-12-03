import React from "react";
import { Link } from "react-router-dom";
import "../styles/terms.css";

export default function Terms() {
return (
    <main className="terms-min page-section" aria-labelledby="terms-title">
        <div className="Terms-container">
            <h1 id="terms text-center">Terms and Conditions</h1>
            <p className="intro">Welcome to EMOWEB. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
                        <div className="term-card">
                            <h2 className="term-title">1. Acceptance of Terms</h2>
                            <p>By using this website, you agree to these terms and conditions. If you do not agree, please do not use our site.</p>
                        </div>

                        <div className="term-card">
                            <h2 className="term-title">2. Use of the Website</h2>
                            <p>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website.</p>
                        </div>

                        <div className="term-card">
                            <h2 className="term-title">3. Intellectual Property</h2>
                            <p>All content on this website, including text, graphics, logos, and images, is the property of EMOWEB or its content suppliers and is protected by international copyright laws.</p>
                        </div>

                        <div className="term-card">
                            <h2 className="term-title">4. Limitation of Liability</h2>
                            <p>EMOWEB shall not be liable for any damages arising out of or in connection with the use of this website.</p>
                        </div>

                        <div className="term-card">
                            <h2 className="term-title">5. Changes to Terms</h2>
                            <p>We reserve the right to modify these terms at any time. Your continued use of the website after any changes indicates your acceptance of the new terms.</p>
                        </div>

                        <div className="term-card">
                            <h2 className="term-title">6. Governing Law</h2>
                            <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which EMOWEB operates.</p>
                        </div>
            <p className="outro"><Link to="/contact" className="outro-link"><span className="outro-inner">If you have any questions about these terms, please contact us.<span className="outro-bar bar-1" aria-hidden="true"></span><span className="outro-bar bar-2" aria-hidden="true"></span><span className="outro-bar bar-3" aria-hidden="true"></span></span></Link></p>
        </div>
    </main>
);
}