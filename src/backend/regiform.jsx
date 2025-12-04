import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/signform.css";
import "../styles/regiform.css";

export default function Regiform() {
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        // Placeholder: send registration payload to server
        console.log("register", { firstName, middleInitial, lastName, contactNumber, username, email });
        alert("Registration submitted (placeholder)");
    }

    return (
        <main className="regiform-container flex flex-col min-h-screen items-center justify-center">
            <div className="regiform">
                <h2 className="subtext">REGISTER</h2>
                <h1 className="introtext">Create your account</h1>
                <p className="desctext">Please provide the information below to register.</p>

                <form className="sf-form" onSubmit={handleSubmit}>
                    <fieldset className="regiform-fieldset regiform-tight">
                        <legend className="regiform-legend">User Info</legend>
                        <input className="usertextbox" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Middle Initial" maxLength={1} value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                        <input className="usertextbox" type="tel" placeholder="Contact Number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                    </fieldset>

                    <div className="regiform-spacer-tight"/>

                    <div className="rf-divider" role="separator" aria-hidden="true"/>

                    <fieldset className="regiform-fieldset">
                        <legend className="regiform-legend">User Account</legend>
                        <input className="usertextbox" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                        <input className="usertextbox" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

                        <div className="sf-password-row">
                            <input className="passtextbox" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                            <button type="button" className="sf-showpw" onClick={() => setShowPassword(s => !s)} aria-pressed={showPassword}>{showPassword ? 'Hide' : 'Show'}</button>
                        </div>

                        <div className="sf-password-row">
                            <input className="passtextbox" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                    </fieldset>

                    <div className="regiform-spacer-sm" />

                    <button type="submit" className="registerbutton" aria-label="Create account">
                        <span className="register-inner">Create Account</span>
                        <span className="register-bar bar-1" aria-hidden="true" />
                        <span className="register-bar bar-2" aria-hidden="true" />
                        <span className="register-bar bar-3" aria-hidden="true" />
                        <span className="register-bar bar-4" aria-hidden="true" />
                    </button>
                </form>

                <div style={{marginTop:12}}>
                    <Link to="/signform" className="regiform-backlink">Back to Sign In</Link>
                </div>
            </div>
        </main>
    );
}
