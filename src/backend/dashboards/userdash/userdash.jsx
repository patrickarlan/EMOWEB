import React, { useState } from "react";
import USSidebar from "./USsidebar";
import ProfileSettings from "./components/ProfileSettings";
import AccountSettings from "./components/AccountSettings";
import Orders from "./components/Orders";
import CancelledOrders from "./components/CancelledOrders";
import Cart from "./components/Cart";
import PasswordVerification from "../../../components/PasswordVerification";
import PrototypeDashboard from "../../../proto/prototype";
import "../userdash/userdash.css";

export default function UserDash() {
    const [activePanel, setActivePanel] = useState("orders");
    const [orderFilter, setOrderFilter] = useState("active"); // "active", "delivered", "cancelled"
    const [verificationOpen, setVerificationOpen] = useState(false);
    const [pendingPanel, setPendingPanel] = useState(null);
    const [verifiedSections, setVerifiedSections] = useState(new Set());
    const [targetSection, setTargetSection] = useState("");
    const [deactivationVerificationOpen, setDeactivationVerificationOpen] = useState(false);
    const [pendingDeactivationDays, setPendingDeactivationDays] = useState(null);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const [userRole, setUserRole] = useState(null);

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

    const handleRequestDeactivation = (days) => {
        console.log('handleRequestDeactivation called with days:', days);
        setPendingDeactivationDays(days);
        setDeactivationVerificationOpen(true);
    };

    const handleDeactivationVerified = () => {
        console.log('Deactivation verified, days still:', pendingDeactivationDays);
        setDeactivationVerificationOpen(false);
        setShowDeactivateConfirm(true);
    };

    const handleDeactivationClose = () => {
        console.log('Deactivation cancelled');
        setDeactivationVerificationOpen(false);
        // Don't clear pendingDeactivationDays here - it's needed for the confirmation
        // Only clear it when user cancels the final confirmation or completes deactivation
    };

    const handleConfirmDeactivation = async () => {
        setDeactivating(true);

        console.log('Attempting deactivation with days:', pendingDeactivationDays);

        try {
            const response = await fetch("http://localhost:4000/api/account/deactivate", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    days: pendingDeactivationDays
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login page
                window.location.href = "/";
                // Clear the pending days (though page will reload anyway)
                setPendingDeactivationDays(null);
            } else {
                // Handle error silently or show in UI if needed
                console.error("Deactivation failed:", data.error);
                setDeactivating(false);
                setShowDeactivateConfirm(false);
                setPendingDeactivationDays(null);
            }
        } catch (error) {
            console.error("Error deactivating account:", error);
            setDeactivating(false);
            setShowDeactivateConfirm(false);
            setPendingDeactivationDays(null);
        }
    };

    const handleCancelDeactivation = () => {
        console.log('User cancelled final deactivation confirmation');
        setShowDeactivateConfirm(false);
        setPendingDeactivationDays(null);
    };

    return (
        <div className="userdash-layout">
            <USSidebar activePanel={activePanel} setActivePanel={handlePanelClick} />

            {/* Password verification for accessing protected sections */}
            <PasswordVerification
                isOpen={verificationOpen}
                onClose={handleVerificationClose}
                onVerify={handleVerificationSuccess}
                targetSection={targetSection}
            />

            {/* Password verification for account deactivation */}
            <PasswordVerification
                isOpen={deactivationVerificationOpen}
                onClose={handleDeactivationClose}
                onVerify={handleDeactivationVerified}
                targetSection="Account Deactivation"
            />

            {/* Deactivation confirmation modal */}
            {showDeactivateConfirm && (
                <div className="deactivation-confirmation-overlay" onClick={handleCancelDeactivation}>
                    <div className="deactivation-confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Account Deactivation</h2>
                        <p>Are you sure you want to deactivate your account for {pendingDeactivationDays} day(s)?</p>
                        <p className="warning-text">You will be logged out immediately and can reactivate by logging in again after the period ends.</p>
                        <div className="confirmation-actions">
                            <button
                                onClick={handleCancelDeactivation}
                                className="btn-cancel-deactivation"
                                disabled={deactivating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeactivation}
                                className="btn-confirm-deactivation"
                                disabled={deactivating}
                            >
                                {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="userdash-main">
                {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="dashboard-switcher">
                        <a href="/admindash" className="btn-switch-dashboard">
                            <span className="switch-icon">⚡</span>
                            Switch to Admin Dashboard
                        </a>
                    </div>
                )}
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
                                            className={`toggle-btn ${orderFilter === 'active' ? 'active' : ''}`}
                                            onClick={() => setOrderFilter('active')}
                                        >
                                            Active Orders
                                        </button>
                                        <button 
                                            className={`toggle-btn ${orderFilter === 'delivered' ? 'active' : ''}`}
                                            onClick={() => setOrderFilter('delivered')}
                                        >
                                            Delivered
                                        </button>
                                        <button 
                                            className={`toggle-btn ${orderFilter === 'cancelled' ? 'active' : ''}`}
                                            onClick={() => setOrderFilter('cancelled')}
                                        >
                                            Cancelled Orders
                                        </button>
                                    </div>
                                    {orderFilter === 'cancelled' ? (
                                        <CancelledOrders />
                                    ) : (
                                        <Orders 
                                            filterStatus={orderFilter} 
                                            onOrderCancelled={() => setOrderFilter('cancelled')} 
                                        />
                                    )}
                                </>
                            )}
                            {activePanel === "cart" && <Cart />}
                            {activePanel === "settings" && <AccountSettings onRequestDeactivation={handleRequestDeactivation} />}
                            {activePanel === "prototype" && <PrototypeDashboard />}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
