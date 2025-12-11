import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import "../styles/signform.css";

export default function SignForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [deactivationModal, setDeactivationModal] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const saved = localStorage.getItem("emo_username");
            if (saved) {
                setUsername(saved);
                setRemember(true);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include', // allow HttpOnly cookie to be set
                body: JSON.stringify({ username, password, rememberMe: remember }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if this is a deactivation error
                if (data.type === 'admin_deactivated') {
                    setDeactivationModal({
                        type: 'admin',
                        message: data.message || 'Your account has been deactivated by an administrator. Please contact support for assistance.'
                    });
                } else if (data.type === 'user_deactivated') {
                    const deactivatedDate = new Date(data.deactivatedUntil);
                    setDeactivationModal({
                        type: 'user',
                        message: data.message,
                        deactivatedUntil: deactivatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        deactivatedTime: deactivatedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    });
                } else {
                    setError(data.error || "Login failed");
                }
                setLoading(false);
                return;
            }

            // Handle remember me
            if (remember) {
                try { localStorage.setItem("emo_username", username); } catch (e) {}
            } else {
                try { localStorage.removeItem("emo_username"); } catch (e) {}
            }

            // Check if user is admin or super admin
            const isAdmin = data.role === 'admin' || data.role === 'super_admin' || data.isSuperAdmin;
            const redirectPath = isAdmin ? '/admindash' : '/userdash';
            const welcomeMessage = isAdmin
                ? `Welcome back, Administrator! Access granted.` 
                : `Welcome back, ${data.username}! Login successful.`;
            
            // Show success notification
            setNotification({ 
                message: welcomeMessage, 
                type: 'success' 
            });
            
            // Redirect after showing notification
            setTimeout(() => {
                navigate(redirectPath);
            }, 1500);
            
            // Clear form
            setPassword("");
            setLoading(false);
        } catch (err) {
            setError("Network error. Please try again.");
            setLoading(false);
        }
    }

    return (
        <main className="signform-container flex flex-col min-h-screen items-center justify-center">
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="signform">
                <h2 className="subtext">SIGN IN</h2>
                <img src="src/pics/emoweb.png" alt="EMOWEB Logo" className="signform-logo" />
                <h1 className="introtext">WELCOME TO EMOWEB</h1>
                <p className="desctext">Please enter your username and password to sign in.</p>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <form className="sf-form" onSubmit={handleSubmit}>
                    <input id="username" className={`usertextbox ${error ? 'error' : ''}`} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />

                    <div className="sf-password-row">
                      <input id="password" className={`passtextbox ${error ? 'error' : ''}`} type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" aria-pressed={showPassword} className="sf-showpw" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                    </div>

                                        <div className="sf-controls">
                                                <label className="sf-remember">
                                                    <input type="checkbox" className="remember-checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                                    <span className="remlabel">Remember me</span>
                                                </label>
                                                <a href="#" className="sf-forgot">Forgot password?</a>
                                        </div>

                        <button className={`submitbutton ${error ? 'error' : ''}`} type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                </form>

                <div className="sf-divider" aria-hidden="true">
                    <span className="sf-line" />
                    <span className="sf-or">or</span>
                    <span className="sf-line" />
                </div>

                <Link to="/register" className="registerbutton no-underline" aria-label="Register">
                    <span className="register-inner">Register
                        <span className="register-bar bar-1" aria-hidden="true" />
                        <span className="register-bar bar-2" aria-hidden="true" />
                        <span className="register-bar bar-3" aria-hidden="true" />
                        <span className="register-bar bar-4" aria-hidden="true" />
                    </span>
                </Link>
            </div>

            {/* Deactivation Modal */}
            {deactivationModal && (
                <div className="deactivation-modal-overlay" onClick={() => setDeactivationModal(null)}>
                    <div className="deactivation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="deactivation-modal-icon">
                            {deactivationModal.type === 'admin' ? (
                                <svg viewBox="0 0 52 52" className="deactivation-lock">
                                    <circle className="deactivation-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path className="deactivation-lock-body" d="M26 15v-4a6 6 0 0 0-6 6v4m0 0h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V23a2 2 0 0 1 2-2z" fill="none" stroke="#ef4444" strokeWidth="2"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 52 52" className="deactivation-clock">
                                    <circle className="deactivation-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <circle cx="26" cy="26" r="10" fill="none" stroke="#f59e0b" strokeWidth="2"/>
                                    <path d="M26 20v6l4 2" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            )}
                        </div>
                        <h2 className="deactivation-modal-title">
                            {deactivationModal.type === 'admin' ? 'Account Deactivated' : 'Account Temporarily Deactivated'}
                        </h2>
                        <p className="deactivation-modal-message">
                            {deactivationModal.message}
                        </p>
                        {deactivationModal.type === 'user' && (
                            <div className="deactivation-dates">
                                <div className="deactivation-date-item">
                                    <span className="deactivation-date-label">Reactivation Date:</span>
                                    <span className="deactivation-date-value">{deactivationModal.deactivatedUntil}</span>
                                </div>
                                <div className="deactivation-date-item">
                                    <span className="deactivation-date-label">Reactivation Time:</span>
                                    <span className="deactivation-date-value">{deactivationModal.deactivatedTime}</span>
                                </div>
                            </div>
                        )}
                        {deactivationModal.type === 'admin' && (
                            <p className="deactivation-support-info">
                                📧 Contact support: <Link to="/contact" className="deactivation-support-link">Visit Contact Page</Link>
                            </p>
                        )}
                        <button className="deactivation-modal-close" onClick={() => setDeactivationModal(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
