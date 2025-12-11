import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./styles/AdminProfileSettings.css";

export default function AdminProfileSettings() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    region: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    countryCode: "+63",
    contactNumber: "",
    profilePicture: "",
    username: "",
    email: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const regions = [
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Africa",
    "Oceania",
    "Antarctica"
  ];

  const regionOptions = regions.map(region => ({ value: region, label: region }));

  const countryCodes = [
    { code: "+63", flag: "🇵🇭", country: "PHIL", maxLength: 10 },
    { code: "+1", flag: "🇺🇸", country: "USA", maxLength: 10 },
    { code: "+1", flag: "🇨🇦", country: "CAN", maxLength: 10 },
    { code: "+44", flag: "🇬🇧", country: "UK", maxLength: 10 },
    { code: "+61", flag: "🇦🇺", country: "AUS", maxLength: 9 },
    { code: "+81", flag: "🇯🇵", country: "JPN", maxLength: 10 },
    { code: "+82", flag: "🇰🇷", country: "KOR", maxLength: 10 },
    { code: "+86", flag: "🇨🇳", country: "CHN", maxLength: 11 },
    { code: "+91", flag: "🇮🇳", country: "IND", maxLength: 10 },
    { code: "+49", flag: "🇩🇪", country: "GER", maxLength: 11 },
    { code: "+33", flag: "🇫🇷", country: "FRA", maxLength: 9 },
    { code: "+39", flag: "🇮🇹", country: "ITA", maxLength: 10 },
    { code: "+34", flag: "🇪🇸", country: "ESP", maxLength: 9 },
    { code: "+7", flag: "🇷🇺", country: "RUS", maxLength: 10 },
    { code: "+55", flag: "🇧🇷", country: "BRA", maxLength: 11 },
    { code: "+52", flag: "🇲🇽", country: "MEX", maxLength: 10 },
  ];

  const countryCodeOptions = countryCodes.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.country} | ${country.code}`,
    maxLength: country.maxLength
  }));

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 107, 53, 0.3)',
      borderRadius: '8px',
      padding: '4px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(255, 107, 53, 0.2)' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 107, 53, 0.5)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(30, 30, 30, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 107, 53, 0.3)',
      borderRadius: '8px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(255, 107, 53, 0.3)' : 'transparent',
      color: '#ffffff',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'rgba(255, 107, 53, 0.5)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    input: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Profile data received:", data);
          setFormData({
            firstName: data.firstName || "",
            middleInitial: data.middleInitial || "",
            lastName: data.lastName || "",
            region: data.region || "",
            country: data.country || "",
            city: data.city || "",
            address: data.address || "",
            postalCode: data.postalCode || "",
            countryCode: data.countryCode || "+63",
            contactNumber: data.contactNumber || "",
            profilePicture: data.profilePicture || "",
            username: data.username || "",
            email: data.email || ""
          });
          
          // Set profile picture preview if exists
          if (data.profilePicture) {
            setImagePreview(`http://localhost:4000${data.profilePicture}`);
          }
        } else {
          console.error("Failed to fetch profile:", response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error("Error details:", errorData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle contact number input - only allow digits
    if (name === "contactNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      const selectedCountry = countryCodeOptions.find(c => c.value === formData.countryCode);
      const maxLength = selectedCountry ? selectedCountry.maxLength : 15;
      
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly.slice(0, maxLength)
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      region: selectedOption ? selectedOption.value : ""
    }));
  };

  const handleCountryCodeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      countryCode: selectedOption ? selectedOption.value : "+63"
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 1MB" });
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setMessage({ type: "error", text: "Only JPEG, PNG, and WebP images are allowed" });
      return;
    }

    // Validate dimensions using Image object
    const img = new Image();
    img.onload = () => {
      if (img.width > 3000 || img.height > 3000) {
        setMessage({ type: "error", text: "Image dimensions must not exceed 3000x3000 pixels" });
        URL.revokeObjectURL(img.src);
        return;
      }

      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage({ type: "", text: "" });
    };
    img.src = URL.createObjectURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;

    setUploadingImage(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("profilePicture", profileImage);

      const response = await fetch("http://localhost:4000/api/upload/profile-picture", {
        method: "POST",
        credentials: "include",
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, profilePicture: data.profilePicture }));
        setImagePreview(`http://localhost:4000${data.profilePicture}`);
        setProfileImage(null);
        setMessage({ type: "success", text: "Profile picture updated successfully!" });
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to upload image" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.profilePicture) return;

    setUploadingImage(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:4000/api/upload/profile-picture", {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, profilePicture: "" }));
        setImagePreview(null);
        setProfileImage(null);
        setMessage({ type: "success", text: "Profile picture removed successfully!" });
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to delete image" });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:4000/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setFormData(prev => ({
          ...prev,
          firstName: updatedData.firstName || "",
          middleInitial: updatedData.middleInitial || "",
          lastName: updatedData.lastName || "",
          region: updatedData.region || "",
          country: updatedData.country || "",
          city: updatedData.city || "",
          address: updatedData.address || "",
          postalCode: updatedData.postalCode || "",
          countryCode: updatedData.countryCode || "+63",
          contactNumber: updatedData.contactNumber || ""
        }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setChangingPassword(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:4000/api/auth/change-password", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordErrors({});
        setShowPasswordChange(false);
      } else {
        const errorData = await response.json();
        // Set error on the appropriate field
        if (errorData.error && errorData.error.toLowerCase().includes('current password')) {
          setPasswordErrors({ currentPassword: errorData.error });
        } else {
          setMessage({ type: "error", text: errorData.error || "Failed to change password" });
        }
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <h3 className="admin-profile-title">Admin Profile Settings</h3>
        <p className="admin-profile-subtitle">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h3 className="admin-profile-title">Admin Profile Settings</h3>
      <p className="admin-profile-subtitle">Manage your personal information and account settings</p>

      {message.text && (
        <div className={`admin-profile-message admin-profile-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Account Info Section */}
      <div className="admin-account-info-section">
        <h4 className="admin-section-subtitle">Account Information</h4>
        <div className="admin-account-info-grid">
          <div className="admin-info-item">
            <label className="admin-info-label">Username</label>
            <div className="admin-info-value">{formData.username}</div>
          </div>
          <div className="admin-info-item">
            <label className="admin-info-label">Email</label>
            <div className="admin-info-value">{formData.email}</div>
          </div>
        </div>
        <button
          type="button"
          className="admin-btn-change-password"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
        >
          <i className="fas fa-key"></i>
          {showPasswordChange ? "Cancel Password Change" : "Change Password"}
        </button>
      </div>

      {/* Password Change Form */}
      {showPasswordChange && (
        <form className="admin-password-form" onSubmit={handlePasswordSubmit}>
          <h4 className="admin-section-subtitle">Change Password</h4>
          
          <div className="admin-form-group">
            <label htmlFor="currentPassword" className="admin-form-label">
              Current Password
            </label>
            <div className="input-with-tooltip">
              <div className="admin-password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`admin-form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                  placeholder="Enter current password"
                  autoComplete="off"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {passwordErrors.currentPassword && <span className="error-tooltip">{passwordErrors.currentPassword}</span>}
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="newPassword" className="admin-form-label">
              New Password
            </label>
            <div className="input-with-tooltip">
              <div className="admin-password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`admin-form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                  placeholder="Enter new password (min 6 characters)"
                  autoComplete="new-password"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {passwordErrors.newPassword && <span className="error-tooltip">{passwordErrors.newPassword}</span>}
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="confirmPassword" className="admin-form-label">
              Confirm New Password
            </label>
            <div className="input-with-tooltip">
              <div className="admin-password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`admin-form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {passwordErrors.confirmPassword && <span className="error-tooltip">{passwordErrors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="admin-btn-submit-password" disabled={changingPassword}>
            {changingPassword ? "Changing..." : "Update Password"}
          </button>
        </form>
      )}

      {/* Profile Picture Section */}
      <div className="admin-profile-picture-section">
        <h4 className="admin-section-subtitle">Profile Picture</h4>
        <div className="admin-profile-picture-container">
          <div className="admin-profile-picture-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="admin-profile-picture-img" />
            ) : (
              <div className="admin-profile-picture-placeholder">
                <span className="admin-placeholder-icon">👤</span>
              </div>
            )}
          </div>
          <div className="admin-profile-picture-actions">
            <p className="admin-upload-instructions">
              Max 1MB • Up to 3000x3000px • JPG, PNG, or WebP
            </p>
            <input
              type="file"
              id="adminProfilePictureInput"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="admin-file-input"
              style={{ display: 'none' }}
            />
            <div className="admin-picture-buttons">
              <label htmlFor="adminProfilePictureInput" className="admin-btn admin-btn-upload">
                Choose Image
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="admin-btn admin-btn-upload-confirm"
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              )}
              {formData.profilePicture && !profileImage && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  disabled={uploadingImage}
                  className="admin-btn admin-btn-delete"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <form className="admin-profile-form" onSubmit={handleSubmit}>
        <h4 className="admin-section-subtitle">Personal Information</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label htmlFor="firstName" className="admin-form-label">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="admin-form-group admin-form-group-small">
            <label htmlFor="middleInitial" className="admin-form-label">
              M.I.
            </label>
            <input
              type="text"
              id="middleInitial"
              name="middleInitial"
              value={formData.middleInitial}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="M.I."
              maxLength="2"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="lastName" className="admin-form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <h4 className="admin-section-subtitle">Address Information</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label htmlFor="region" className="admin-form-label">
              Region
            </label>
            <Select
              id="region"
              name="region"
              value={regionOptions.find(option => option.value === formData.region)}
              onChange={handleRegionChange}
              options={regionOptions}
              placeholder="Select Region"
              styles={selectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="country" className="admin-form-label">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter country"
              required
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label htmlFor="city" className="admin-form-label">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter city"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="postalCode" className="admin-form-label">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter postal code"
              required
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label htmlFor="address" className="admin-form-label">
            Street Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="admin-form-input admin-form-textarea"
            placeholder="Enter street address"
            rows="3"
            required
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="contactNumber" className="admin-form-label">
            Contact Number
          </label>
          <div className="admin-phone-input-wrapper">
            <Select
              name="countryCode"
              value={countryCodeOptions.find(option => option.value === formData.countryCode)}
              onChange={handleCountryCodeChange}
              options={countryCodeOptions}
              styles={selectStyles}
              className="react-select-container admin-phone-country-select-react"
              classNamePrefix="react-select"
              isSearchable={false}
              menuPlacement="top"
            />
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="admin-form-input admin-phone-number-input"
              placeholder={`${formData.contactNumber ? "" : "Enter number"}`}
              required
              maxLength={countryCodeOptions.find(c => c.value === formData.countryCode)?.maxLength || 15}
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-save" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="admin-btn-cancel" onClick={() => {
            setFormData(prev => ({
              ...prev,
              firstName: "",
              middleInitial: "",
              lastName: "",
              region: "",
              country: "",
              city: "",
              address: "",
              postalCode: "",
              countryCode: "+63",
              contactNumber: ""
            }));
          }}>
            Clear
          </button>
        </div>
      </form>
    </>
  );
}
