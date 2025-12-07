import React, { useState, useEffect } from "react";
import "./styles/AccountSettings.css";

export default function AccountSettings() {
  const [email, setEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deactivateDays, setDeactivateDays] = useState(7);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: "error", text: "All password fields are required" });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      setSaving(false);
      return;
    }

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
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:4000/api/account/deactivate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          days: deactivateDays
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: `Account will be deactivated for ${deactivateDays} days` });
        setShowDeactivateConfirm(false);
        // Optional: redirect to logout or home page after deactivation
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.error || "Failed to deactivate account" });
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
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
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              className="form-input"
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="form-input"
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="form-input"
              placeholder="Confirm new password"
              required
            />
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
            <select
              id="deactivateDays"
              value={deactivateDays}
              onChange={(e) => setDeactivateDays(Number(e.target.value))}
              className="form-input form-select"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
            </select>
          </div>

          {!showDeactivateConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeactivateConfirm(true)}
              className="btn btn-deactivate"
            >
              Deactivate Account
            </button>
          ) : (
            <div className="confirm-deactivate">
              <p className="confirm-text">
                Are you sure you want to deactivate your account for {deactivateDays} day(s)?
              </p>
              <div className="confirm-buttons">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={saving}
                  className="btn btn-confirm-deactivate"
                >
                  {saving ? "Deactivating..." : "Yes, Deactivate"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
