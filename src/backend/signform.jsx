import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/signform.css";

export default function SignForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
                return;
            }

            // Handle remember me
            if (remember) {
                try { localStorage.setItem("emo_username", username); } catch (e) {}
            } else {
                try { localStorage.removeItem("emo_username"); } catch (e) {}
            }

            // Show success message
            alert(`Welcome back, ${data.username}! Login successful.`);
            
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
                    <input id="username" className="usertextbox" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />

                    <div className="sf-password-row">
                      <input id="password" className="passtextbox" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" aria-pressed={showPassword} className="sf-showpw" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                    </div>

                                        <div className="sf-controls">
                                                <label className="sf-remember">
                                                    <input type="checkbox" className="remember-checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                                    <span className="remlabel">Remember me</span>
                                                </label>
                                                <a href="#" className="sf-forgot">Forgot password?</a>
                                        </div>

                        <button className="submitbutton" type="submit" disabled={loading}>
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
        </main>
    );
}
