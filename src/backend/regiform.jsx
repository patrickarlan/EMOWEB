import React, { useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import "../styles/signform.css";
import "../styles/regiform.css";

export default function Regiform() {
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+63");
    const [region, setRegion] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const regionOptions = [
        { value: "Asia", label: "Asia" },
        { value: "Europe", label: "Europe" },
        { value: "North America", label: "North America" },
        { value: "South America", label: "South America" },
        { value: "Africa", label: "Africa" },
        { value: "Oceania", label: "Oceania" },
        { value: "Antarctica", label: "Antarctica" }
    ];

    const countryCodeOptions = [
        { value: "+63", label: "🇵🇭 PHIL | +63", maxLength: 10 },
        { value: "+1", label: "🇺🇸 USA | +1", maxLength: 10 },
        { value: "+1", label: "🇨🇦 CAN | +1", maxLength: 10 },
        { value: "+44", label: "🇬🇧 UK | +44", maxLength: 10 },
        { value: "+61", label: "🇦🇺 AUS | +61", maxLength: 9 },
        { value: "+81", label: "🇯🇵 JPN | +81", maxLength: 10 },
        { value: "+82", label: "🇰🇷 KOR | +82", maxLength: 10 },
        { value: "+86", label: "🇨🇳 CHN | +86", maxLength: 11 },
        { value: "+91", label: "🇮🇳 IND | +91", maxLength: 10 },
        { value: "+49", label: "🇩🇪 GER | +49", maxLength: 11 },
        { value: "+33", label: "🇫🇷 FRA | +33", maxLength: 9 },
        { value: "+39", label: "🇮🇹 ITA | +39", maxLength: 10 },
        { value: "+34", label: "🇪🇸 ESP | +34", maxLength: 9 },
        { value: "+7", label: "🇷🇺 RUS | +7", maxLength: 10 },
        { value: "+55", label: "🇧🇷 BRA | +55", maxLength: 11 },
        { value: "+52", label: "🇲🇽 MEX | +52", maxLength: 10 },
    ];

    const handleContactChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        const selectedCountry = countryCodeOptions.find(c => c.value === countryCode);
        const maxLength = selectedCountry ? selectedCountry.maxLength : 15;
        setContactNumber(digitsOnly.slice(0, maxLength));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!username || !email || !password) {
            setError("Username, email, and password are required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, middleInitial, lastName, contactNumber, countryCode, region, country, city, address, postalCode, username, email, password })
            });
            const data = await response.json();
            
            if (!response.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }
            
            // Success
            alert('Registration successful! User ID: ' + data.id);
            // Optional: redirect to sign-in or clear form
            setFirstName(""); setMiddleInitial(""); setLastName(""); setContactNumber(""); setCountryCode("+63");
            setRegion(""); setCountry(""); setCity(""); setAddress(""); setPostalCode("");
            setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
        } catch (err) {
            setError('Network error. Make sure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="regiform-container flex flex-col min-h-screen items-center justify-center">
            <div className="regiform">
                <h2 className="subtext">REGISTER</h2>
                <h1 className="introtext">Create your account</h1>
                <p className="desctext">Please provide the information below to register.</p>

                {error && (
                    <div style={{color:'#ff6b6b', background:'rgba(255,107,107,0.1)', padding:'10px 14px', borderRadius:'8px', marginBottom:'12px', width:'100%', maxWidth:420, textAlign:'center'}}>
                        {error}
                    </div>
                )}

                <form className="sf-form" onSubmit={handleSubmit}>
                    <fieldset className="regiform-fieldset regiform-tight">
                        <legend className="regiform-legend">User Info</legend>
                        <input className="usertextbox" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Middle Initial" maxLength={1} value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                        
                        <div className="phone-input-wrapper-regiform">
                            <Select
                                value={countryCodeOptions.find(option => option.value === countryCode)}
                                onChange={(selectedOption) => setCountryCode(selectedOption.value)}
                                options={countryCodeOptions}
                                className="react-select-container-regiform"
                                classNamePrefix="react-select"
                                isSearchable={false}
                                menuPlacement="top"
                            />
                            <input 
                                className="usertextbox phone-number-input-regiform" 
                                type="tel" 
                                placeholder="Contact Number" 
                                value={contactNumber} 
                                onChange={handleContactChange}
                                maxLength={countryCodeOptions.find(c => c.value === countryCode)?.maxLength || 15}
                            />
                        </div>
                    </fieldset>

                    <div className="regiform-spacer-tight"/>

                    <div className="rf-divider" role="separator" aria-hidden="true"/>

                    <fieldset className="regiform-fieldset regiform-tight">
                        <legend className="regiform-legend">Address</legend>
                        <Select
                            value={regionOptions.find(option => option.value === region)}
                            onChange={(selectedOption) => setRegion(selectedOption ? selectedOption.value : "")}
                            options={regionOptions}
                            placeholder="Select Region"
                            className="react-select-container-regiform"
                            classNamePrefix="react-select"
                            isClearable
                        />
                        <input className="usertextbox" type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Street Address" value={address} onChange={e => setAddress(e.target.value)} />
                        <input className="usertextbox" type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
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

                    <button type="submit" className="registerbutton" aria-label="Create account" disabled={loading}>
                        <span className="register-inner">{loading ? 'Creating...' : 'Create Account'}</span>
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
