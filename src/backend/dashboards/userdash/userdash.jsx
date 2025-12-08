import React, { useState } from "react";
import USSidebar from "./USsidebar";
import ProfileSettings from "./components/ProfileSettings";
import AccountSettings from "./components/AccountSettings";
import Orders from "./components/Orders";
import CancelledOrders from "./components/CancelledOrders";
import Cart from "./components/Cart";
import PasswordVerification from "../../../components/PasswordVerification";
import "../userdash/userdash.css";

export default function UserDash() {
    const [activePanel, setActivePanel] = useState("orders");
    const [showCancelledOrders, setShowCancelledOrders] = useState(false);
    const [verificationOpen, setVerificationOpen] = useState(false);
    const [pendingPanel, setPendingPanel] = useState(null);
    const [verifiedSections, setVerifiedSections] = useState(new Set());
    const [targetSection, setTargetSection] = useState("");

    const handlePanelClick = (panel) => {
        // Profile and Settings require password verification
        if ((panel === "profile" || panel === "settings") && !verifiedSections.has(panel)) {
            setPendingPanel(panel);
            setTargetSection(panel === "profile" ? "Profile Settings" : "Account Settings");
            setVerificationOpen(true);
        } else {
            setActivePanel(panel);
        }
    };

    const handleVerificationSuccess = () => {
        if (pendingPanel) {
            // Mark this section as verified
            setVerifiedSections(prev => new Set([...prev, pendingPanel]));
            setActivePanel(pendingPanel);
            setPendingPanel(null);
        }
    };

    const handleVerificationClose = () => {
        setVerificationOpen(false);
        setPendingPanel(null);
    };

    return (
        <div className="userdash-layout">
            <USSidebar activePanel={activePanel} setActivePanel={handlePanelClick} />

            <PasswordVerification
                isOpen={verificationOpen}
                onClose={handleVerificationClose}
                onVerify={handleVerificationSuccess}
                targetSection={targetSection}
            />

            <main className="userdash-main">
                <section className="userdash-grid" aria-label="User dashboard panels">
                    <article 
                        className={`dash-box ${activePanel === "orders" ? "active" : ""}`}
                        onClick={() => handlePanelClick("orders")}
                    >
                        <h2 className="dash-title">Orders</h2>
                        <p className="dash-desc">Recent orders and updates.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "cart" ? "active" : ""}`}
                        onClick={() => handlePanelClick("cart")}
                    >
                        <h2 className="dash-title">Cart</h2>
                        <p className="dash-desc">Items in your shopping cart.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "profile" ? "active" : ""}`}
                        onClick={() => handlePanelClick("profile")}
                    >
                        <h2 className="dash-title">Profile</h2>
                        <p className="dash-desc">View and edit your profile information.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "settings" ? "active" : ""}`}
                        onClick={() => handlePanelClick("settings")}
                    >
                        <h2 className="dash-title">Settings</h2>
                        <p className="dash-desc">Account settings and preferences.</p>
                    </article>
                    {/* Detail panel placed as a grid child so it lines up with the fourth column on wide screens */}
                    <section className="dash-detail" aria-label="Detail panel">
                        <div className="dash-detail-inner">
                            {activePanel === "profile" && <ProfileSettings />}
                            {activePanel === "orders" && (
                                <>
                                    <div className="orders-toggle">
                                        <button 
                                            className={`toggle-btn ${!showCancelledOrders ? 'active' : ''}`}
                                            onClick={() => setShowCancelledOrders(false)}
                                        >
                                            Active Orders
                                        </button>
                                        <button 
                                            className={`toggle-btn ${showCancelledOrders ? 'active' : ''}`}
                                            onClick={() => setShowCancelledOrders(true)}
                                        >
                                            Cancelled Orders
                                        </button>
                                    </div>
                                    {showCancelledOrders ? <CancelledOrders /> : <Orders onOrderCancelled={() => setShowCancelledOrders(true)} />}
                                </>
                            )}
                            {activePanel === "cart" && <Cart />}
                            {activePanel === "settings" && <AccountSettings />}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
