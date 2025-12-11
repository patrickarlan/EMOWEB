import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./styles/AccountSettings.css";

export default function AccountSettings({ onRequestDeactivation }) {
  const [email, setEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deactivateDays, setDeactivateDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user email on component mount
  useEffect(() => {
    const fetchEmail = async () => {
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
          setEmail(data.email || "");
        } else {
          console.error("Failed to fetch email:", response.status);
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, []);

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
    setSaving(true);
    setMessage({ type: "", text: "" });
    const errors = {};

    // Validation
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    } else if (passwordData.newPassword === passwordData.oldPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setSaving(false);
      return;
    }

    setPasswordErrors({});

    try {
      const response = await fetch("http://localhost:4000/api/account/change-password", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordErrors({});
      } else {
        const errorData = await response.json();
        // Set error on the appropriate field
        if (errorData.error && errorData.error.toLowerCase().includes('current password')) {
          setPasswordErrors({ oldPassword: errorData.error });
        } else {
          setMessage({ type: "error", text: errorData.error || "Failed to change password" });
        }
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivationRequest = () => {
    console.log('Requesting deactivation with days:', deactivateDays);
    if (onRequestDeactivation) {
      onRequestDeactivation(deactivateDays);
    }
  };

  if (loading) {
    return (
      <>
        <h3 className="account-title">Account Settings</h3>
        <p className="account-subtitle">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h3 className="account-title">Account Settings</h3>
      <p className="account-subtitle">Manage your account security and preferences</p>

      {message.text && (
        <div className={`account-message account-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Email Section */}
      <div className="account-section">
        <h4 className="section-title">Email Address</h4>
        <div className="email-wrapper">
          <div className="email-input-wrapper">
            <input
              type="email"
              value={email}
              readOnly
              className="email-input"
              placeholder="your@email.com"
            />
          </div>
          <div className="verify-button-wrapper">
            <button
              type="button"
              className="btn-verify"
              disabled
              title="Email verification coming soon"
            >
              Verify
            </button>
          </div>
        </div>
        <p className="section-note">Email verification will be available soon</p>
      </div>

      {/* Change Password Section */}
      <div className="account-section">
        <h4 className="section-title">Change Password</h4>
        <form className="password-form" onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword" className="form-label">
              Current Password
            </label>
            <div className="input-with-tooltip">
              <div className="password-input-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.oldPassword ? 'error' : ''}`}
                  placeholder="Enter current password"
                  autoComplete="off"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {passwordErrors.oldPassword && <span className="error-tooltip">{passwordErrors.oldPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="input-with-tooltip">
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {passwordErrors.newPassword && <span className="error-tooltip">{passwordErrors.newPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div className="input-with-tooltip">
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  data-form-type="other"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {passwordErrors.confirmPassword && <span className="error-tooltip">{passwordErrors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-save"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Deactivate Account Section */}
      <div className="account-section danger-section">
        <h4 className="section-title danger-title">Danger Zone</h4>
        <p className="section-description">
          Deactivate your account temporarily. You can reactivate it anytime within the selected period.
        </p>

        <div className="deactivate-container">
          <div className="form-group">
            <label htmlFor="deactivateDays" className="form-label">
              Deactivation Period
            </label>
            <Select
              id="deactivateDays"
              value={{ value: deactivateDays, label: `${deactivateDays} Day${deactivateDays > 1 ? 's' : ''}` }}
              onChange={(option) => setDeactivateDays(option.value)}
              options={[
                { value: 1, label: '1 Day' },
                { value: 3, label: '3 Days' },
                { value: 7, label: '7 Days' },
                { value: 14, label: '14 Days' }
              ]}
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable={false}
              menuPlacement="top"
            />
          </div>

          <button
            type="button"
            onClick={handleDeactivationRequest}
            className="btn btn-deactivate"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </>
  );
}
