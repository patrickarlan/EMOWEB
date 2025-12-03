import React from "react";
import { Link } from "react-router-dom";
import "../styles/privacy.css";

export default function Privacy() {
    return (
        <main className="priv-min page-section" aria-labelledby="privacy-title">
            <div className="Privacy-container">
                <div className="privacy-content">
                    <h1 id="privacy-title" className="privacy-title">Privacy Policy</h1>

                    <p className="intro">Last updated: December 4, 2025</p>

                    <section className="privacy-section">
                        <h2>1. Introduction</h2>
                        <p>
                            EMOWEB (“we”, “us”, or “our”) is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>2. Information We Collect</h2>
                        <p>
                            We may collect information that you provide directly to us, such as when you contact us through the contact form. This may include your name, email address, message contents, and any other information you choose to provide. We also automatically collect certain technical information when you visit the site (e.g., IP address, browser type, pages viewed, and referring URLs) through cookies and similar technologies.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>3. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to operate and improve our website, respond to inquiries, send administrative messages, and to provide a safe and customized experience. We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>4. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our site and store certain information. Cookies help us provide, protect, and improve our services. You can control cookie preferences in your browser settings.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>5. Third-Party Services</h2>
                        <p>
                            We may use third-party services (such as analytics providers) that collect, monitor, and analyze information to help us improve the website. These third parties are bound by their own privacy policies.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>6. Data Security</h2>
                        <p>
                            We implement reasonable administrative, technical, and physical safeguards to protect your personal information. However, no method of transmission or storage is completely secure; we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>7. Children’s Privacy</h2>
                        <p>
                            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information about a child under 13, please contact us and we will take steps to remove it.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>8. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will post the updated policy on this page and indicate the date it was last revised.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>9. Contact Us</h2>
                        <p>
                            If you have questions or concerns about this Privacy Policy, please contact us and we will respond as soon as possible.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}