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
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        const errors = {};
        
        // Validate required fields
        if (!firstName) errors.firstName = "First name is required";
        if (!lastName) errors.lastName = "Last name is required";
        if (!contactNumber) errors.contactNumber = "Contact number is required";
        if (!region) errors.region = "Region is required";
        if (!country) errors.country = "Country is required";
        if (!city) errors.city = "City is required";
        if (!address) errors.address = "Street address is required";
        if (!postalCode) errors.postalCode = "Postal code is required";
        if (!username) errors.username = "Username is required";
        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";
        if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
        if (password && confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        
        setFieldErrors({});

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, middleInitial, lastName, contactNumber, countryCode, region, country, city, address, postalCode, username, email, password })
            });
            const data = await response.json();
            
            if (!response.ok) {
                // Handle backend errors
                if (data.error) {
                    if (data.error.includes('username')) {
                        setFieldErrors({ username: data.error });
                    } else if (data.error.includes('email')) {
                        setFieldErrors({ email: data.error });
                    } else {
                        setFieldErrors({ general: data.error });
                    }
                }
                setLoading(false);
                return;
            }
            
            // Success
            setShowSuccessModal(true);
            // Clear form
            setFirstName(""); setMiddleInitial(""); setLastName(""); setContactNumber(""); setCountryCode("+63");
            setRegion(""); setCountry(""); setCity(""); setAddress(""); setPostalCode("");
            setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
        } catch (err) {
            setFieldErrors({ general: 'Network error. Make sure the server is running.' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const clearFieldError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    return (
        <main className="regiform-container flex flex-col min-h-screen items-center justify-center">
            <div className="regiform">
                <h2 className="subtext">REGISTER</h2>
                <h1 className="introtext">Create your account</h1>
                <p className="desctext">Please provide the information below to register.</p>

                {fieldErrors.general && (
                    <div style={{color:'#ff6b6b', background:'rgba(255,107,107,0.1)', padding:'10px 14px', borderRadius:'8px', marginBottom:'12px', width:'100%', maxWidth:420, textAlign:'center'}}>
                        {fieldErrors.general}
                    </div>
                )}

                <form className="sf-form" onSubmit={handleSubmit}>
                    <fieldset className="regiform-fieldset regiform-tight">
                        <legend className="regiform-legend">User Info</legend>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.firstName ? 'error' : ''}`} 
                                type="text" 
                                placeholder="First Name" 
                                value={firstName} 
                                onChange={e => { setFirstName(e.target.value); clearFieldError('firstName'); }} 
                                required 
                            />
                            {fieldErrors.firstName && <span className="error-tooltip">{fieldErrors.firstName}</span>}
                        </div>
                        <input className="usertextbox" type="text" placeholder="Middle Initial" maxLength={1} value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} />
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.lastName ? 'error' : ''}`} 
                                type="text" 
                                placeholder="Last Name" 
                                value={lastName} 
                                onChange={e => { setLastName(e.target.value); clearFieldError('lastName'); }} 
                                required 
                            />
                            {fieldErrors.lastName && <span className="error-tooltip">{fieldErrors.lastName}</span>}
                        </div>
                        
                        <div className="input-with-tooltip">
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
                                    className={`usertextbox phone-number-input-regiform ${fieldErrors.contactNumber ? 'error' : ''}`} 
                                    type="tel" 
                                    placeholder="Contact Number" 
                                    value={contactNumber} 
                                    onChange={(e) => { handleContactChange(e); clearFieldError('contactNumber'); }}
                                    maxLength={countryCodeOptions.find(c => c.value === countryCode)?.maxLength || 15}
                                    required
                                />
                            </div>
                            {fieldErrors.contactNumber && <span className="error-tooltip">{fieldErrors.contactNumber}</span>}
                        </div>
                    </fieldset>

                    <div className="regiform-spacer-tight"/>

                    <div className="rf-divider" role="separator" aria-hidden="true"/>

                    <fieldset className="regiform-fieldset regiform-tight">
                        <legend className="regiform-legend">Address</legend>
                        <div className="input-with-tooltip">
                            <Select
                                value={regionOptions.find(option => option.value === region)}
                                onChange={(selectedOption) => { setRegion(selectedOption ? selectedOption.value : ""); clearFieldError('region'); }}
                                options={regionOptions}
                                placeholder="Select Region"
                                className={`react-select-container-regiform ${fieldErrors.region ? 'error' : ''}`}
                                classNamePrefix="react-select"
                                isClearable
                            />
                            {fieldErrors.region && <span className="error-tooltip">{fieldErrors.region}</span>}
                        </div>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.country ? 'error' : ''}`} 
                                type="text" 
                                placeholder="Country" 
                                value={country} 
                                onChange={e => { setCountry(e.target.value); clearFieldError('country'); }} 
                                required 
                            />
                            {fieldErrors.country && <span className="error-tooltip">{fieldErrors.country}</span>}
                        </div>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.city ? 'error' : ''}`} 
                                type="text" 
                                placeholder="City" 
                                value={city} 
                                onChange={e => { setCity(e.target.value); clearFieldError('city'); }} 
                                required 
                            />
                            {fieldErrors.city && <span className="error-tooltip">{fieldErrors.city}</span>}
                        </div>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.address ? 'error' : ''}`} 
                                type="text" 
                                placeholder="Street Address" 
                                value={address} 
                                onChange={e => { setAddress(e.target.value); clearFieldError('address'); }} 
                                required 
                            />
                            {fieldErrors.address && <span className="error-tooltip">{fieldErrors.address}</span>}
                        </div>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.postalCode ? 'error' : ''}`} 
                                type="text" 
                                placeholder="Postal Code" 
                                value={postalCode} 
                                onChange={e => { setPostalCode(e.target.value); clearFieldError('postalCode'); }} 
                                required 
                            />
                            {fieldErrors.postalCode && <span className="error-tooltip">{fieldErrors.postalCode}</span>}
                        </div>
                    </fieldset>

                    <div className="regiform-spacer-tight"/>

                    <div className="rf-divider" role="separator" aria-hidden="true"/>

                    <fieldset className="regiform-fieldset">
                        <legend className="regiform-legend">User Account</legend>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.username ? 'error' : ''}`} 
                                type="text" 
                                placeholder="Username" 
                                value={username} 
                                onChange={e => { setUsername(e.target.value); clearFieldError('username'); }} 
                            />
                            {fieldErrors.username && <span className="error-tooltip">{fieldErrors.username}</span>}
                        </div>
                        <div className="input-with-tooltip">
                            <input 
                                className={`usertextbox ${fieldErrors.email ? 'error' : ''}`} 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={e => { setEmail(e.target.value); clearFieldError('email'); }} 
                            />
                            {fieldErrors.email && <span className="error-tooltip">{fieldErrors.email}</span>}
                        </div>

                        <div className="input-with-tooltip">
                            <div className="sf-password-row">
                                <input 
                                    className={`passtextbox ${fieldErrors.password ? 'error' : ''}`} 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={e => { setPassword(e.target.value); clearFieldError('password'); }} 
                                />
                                <button type="button" className="sf-showpw" onClick={() => setShowPassword(s => !s)} aria-pressed={showPassword}>{showPassword ? 'Hide' : 'Show'}</button>
                            </div>
                            {fieldErrors.password && <span className="error-tooltip">{fieldErrors.password}</span>}
                        </div>

                        <div className="input-with-tooltip">
                            <div className="sf-password-row">
                                <input 
                                    className={`passtextbox ${fieldErrors.confirmPassword ? 'error' : ''}`} 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Confirm Password" 
                                    value={confirmPassword} 
                                    onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }} 
                                />
                            </div>
                            {fieldErrors.confirmPassword && <span className="error-tooltip">{fieldErrors.confirmPassword}</span>}
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

            {showSuccessModal && (
                <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-modal-icon">
                            <svg viewBox="0 0 52 52" className="success-checkmark">
                                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                        <h2 className="success-modal-title">Registration Successful!</h2>
                        <p className="success-modal-message">Your account has been created successfully.</p>
                        <Link to="/signform" className="success-modal-button">
                            Go to Sign In
                        </Link>
                        <button className="success-modal-close" onClick={() => setShowSuccessModal(false)}>
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
