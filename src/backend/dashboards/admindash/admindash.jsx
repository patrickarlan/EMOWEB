import React, { useState } from "react";
import ADSidebar from "./ADsidebar";
import AccountSettings from "./components/AccountSettings";
import ProductSettings from "./components/ProductSettings";
import AdminProfileSettings from "./components/AdminProfileSettings";
import "./admindash.css";

export default function AdminDash() {
    const [activePanel, setActivePanel] = useState("products");
    const [userRole, setUserRole] = React.useState(null);

    // Fetch user role on mount
    React.useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };
        fetchUserRole();
    }, []);

    const handlePanelClick = (panel) => {
        setActivePanel(panel);
    };

    return (
        <div className="admindash-layout">
            <ADSidebar activePanel={activePanel} setActivePanel={handlePanelClick} />

            <main className="admindash-main">
                {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="dashboard-switcher">
                        <a href="/userdash" className="btn-switch-dashboard">
                            <span className="switch-icon">👤</span>
                            Switch to User Dashboard
                        </a>
                    </div>
                )}
                <section className="admindash-grid" aria-label="Admin dashboard panels">
                    <article 
                        className={`dash-box ${activePanel === "products" ? "active" : ""}`}
                        onClick={() => handlePanelClick("products")}
                    >
                        <h2 className="dash-title">Product Management</h2>
                        <p className="dash-desc">Manage product inventory and details.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "accounts" ? "active" : ""}`}
                        onClick={() => handlePanelClick("accounts")}
                    >
                        <h2 className="dash-title">Account Settings</h2>
                        <p className="dash-desc">Manage user accounts and settings.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "system" ? "active" : ""}`}
                        onClick={() => handlePanelClick("system")}
                    >
                        <h2 className="dash-title">System Management</h2>
                        <p className="dash-desc">Prototype and system management.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "admin" ? "active" : ""}`}
                        onClick={() => handlePanelClick("admin")}
                    >
                        <h2 className="dash-title">Admin Settings</h2>
                        <p className="dash-desc">Admin settings and configurations.</p>
                    </article>

                    {/* Detail panel */}
                    <section className="dash-detail" aria-label="Detail panel">
                        <div className="dash-detail-inner">
                            {activePanel === "products" && (
                                <ProductSettings />
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
                                <AdminProfileSettings />
                            )}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
