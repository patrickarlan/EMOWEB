import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./styles/ProfileSettings.css";

export default function ProfileSettings() {
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
    profilePicture: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    label: `${country.flag} ${country.code}`,
    maxLength: country.maxLength
  }));

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
            profilePicture: data.profilePicture || ""
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
        setFormData({
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
        });
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

  if (loading) {
    return (
      <>
        <h3 className="profile-title">Profile Settings</h3>
        <p className="profile-subtitle">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h3 className="profile-title">Profile Settings</h3>
      <p className="profile-subtitle">Update your personal information</p>

      {message.text && (
        <div className={`profile-message profile-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="profile-picture-section">
        <h4 className="section-subtitle">Profile Picture</h4>
        <div className="profile-picture-container">
          <div className="profile-picture-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-picture-img" />
            ) : (
              <div className="profile-picture-placeholder">
                <span className="placeholder-icon">👤</span>
              </div>
            )}
          </div>
          <div className="profile-picture-actions">
            <p className="upload-instructions">
              Max 1MB • Up to 3000x3000px • JPG, PNG, or WebP
            </p>
            <input
              type="file"
              id="profilePictureInput"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="file-input"
              style={{ display: 'none' }}
            />
            <div className="picture-buttons">
              <label htmlFor="profilePictureInput" className="btn btn-upload">
                Choose Image
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="btn btn-upload-confirm"
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              )}
              {formData.profilePicture && !profileImage && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  disabled={uploadingImage}
                  className="btn btn-delete"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="form-group form-group-small">
            <label htmlFor="middleInitial" className="form-label">
              M.I.
            </label>
            <input
              type="text"
              id="middleInitial"
              name="middleInitial"
              value={formData.middleInitial}
              onChange={handleChange}
              className="form-input"
              placeholder="M.I."
              maxLength="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-title">Address Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region" className="form-label">
                Region
              </label>
              <Select
                id="region"
                name="region"
                value={regionOptions.find(option => option.value === formData.region)}
                onChange={handleRegionChange}
                options={regionOptions}
                placeholder="Select Region"
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter country"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter city"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode" className="form-label">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter postal code"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Street Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Enter street address"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber" className="form-label">
            Contact Number
          </label>
          <div className="phone-input-wrapper">
            <Select
              name="countryCode"
              value={countryCodeOptions.find(option => option.value === formData.countryCode)}
              onChange={handleCountryCodeChange}
              options={countryCodeOptions}
              className="react-select-container phone-country-select-react"
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
              className="form-input phone-number-input"
              placeholder={`${formData.contactNumber ? "" : "Enter number"}`}
              required
              maxLength={countryCodeOptions.find(c => c.value === formData.countryCode)?.maxLength || 15}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="btn-cancel" onClick={() => setFormData({
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
          })}>
            Clear
          </button>
        </div>
      </form>
    </>
  );
}
