import React, { useState } from "react";
import ADSidebar from "./ADsidebar";
import AccountSettings from "./components/AccountSettings";
import "./admindash.css";

export default function AdminDash() {
    const [activePanel, setActivePanel] = useState("products");

    const handlePanelClick = (panel) => {
        setActivePanel(panel);
    };

    return (
        <div className="admindash-layout">
            <ADSidebar activePanel={activePanel} setActivePanel={handlePanelClick} />

            <main className="admindash-main">
                <section className="admindash-grid" aria-label="Admin dashboard panels">
                    <article 
                        className={`dash-box ${activePanel === "products" ? "active" : ""}`}
                        onClick={() => handlePanelClick("products")}
                    >
                        <h2 className="dash-title">Product M</h2>
                        <p className="dash-desc">Manage product inventory and details.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "accounts" ? "active" : ""}`}
                        onClick={() => handlePanelClick("accounts")}
                    >
                        <h2 className="dash-title">Account S</h2>
                        <p className="dash-desc">Manage user accounts and settings.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "system" ? "active" : ""}`}
                        onClick={() => handlePanelClick("system")}
                    >
                        <h2 className="dash-title">System M</h2>
                        <p className="dash-desc">Prototype and system management.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "admin" ? "active" : ""}`}
                        onClick={() => handlePanelClick("admin")}
                    >
                        <h2 className="dash-title">Admin</h2>
                        <p className="dash-desc">Admin settings and configurations.</p>
                    </article>

                    {/* Detail panel */}
                    <section className="dash-detail" aria-label="Detail panel">
                        <div className="dash-detail-inner">
                            {activePanel === "products" && (
                                <div className="detail-content">
                                    <h3>Product Management</h3>
                                    <p>Product management content will appear here.</p>
                                </div>
                            )}
                            {activePanel === "accounts" && (
                                <AccountSettings />
                            )}
                            {activePanel === "system" && (
                                <div className="detail-content">
                                    <h3>System Management</h3>
                                    <p>Prototype and system management content will appear here.</p>
                                </div>
                            )}
                            {activePanel === "admin" && (
                                <div className="detail-content">
                                    <h3>Admin Settings</h3>
                                    <p>Admin settings content will appear here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
