import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api";

const EmergencyReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await API.post("/admin/forgot-password", {
        usernameOrEmail
      });

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "If the account exists, a password reset link has been sent."
      });

      setUsernameOrEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to process the request. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setStatus({ type: "", message: "" });

    if (newPassword.length < 8) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters long."
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/admin/reset-password", {
        token,
        newPassword
      });

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "Password updated successfully. Redirecting to login..."
      });

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to reset password. The link may have expired."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "14px"
  };

  const passwordWrapperStyle = {
    position: "relative",
    width: "100%",
    marginBottom: "15px"
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: "45px"
  };

  const iconStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    userSelect: "none",
    opacity: 0.7
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        background: "#f7f7f7",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          boxSizing: "border-box"
        }}
      >
        {!token ? (
          <>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "10px"
              }}
            >
              Forgot Password?
            </h2>

            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.5",
                marginBottom: "25px"
              }}
            >
              Enter your admin username or email address. If the account
              exists, we will send you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword}>
              <input
                type="text"
                placeholder="Username or Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  ...inputStyle,
                  marginBottom: "15px"
                }}
              />

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isLoading ? "#666" : "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "16px"
                }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "10px"
              }}
            >
              Reset Password
            </h2>

            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.5",
                marginBottom: "25px"
              }}
            >
              Enter your new admin password below.
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={passwordWrapperStyle}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  style={passwordInputStyle}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={iconStyle}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </span>
              </div>

              <div style={passwordWrapperStyle}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  style={passwordInputStyle}
                />

                <span
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={iconStyle}
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isLoading ? "#666" : "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "16px"
                }}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}

        {status.message && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "6px",
              backgroundColor:
                status.type === "success" ? "#e6fffa" : "#fff5f5",
              color:
                status.type === "success" ? "#2c7a7b" : "#c53030",
              border: `1px solid ${
                status.type === "success" ? "#81e6d9" : "#feb2b2"
              }`,
              fontSize: "14px",
              lineHeight: "1.5"
            }}
          >
            {status.message}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            textAlign: "center"
          }}
        >
          <Link
            to="/admin/login"
            style={{
              fontSize: "13px",
              color: "#007bff",
              textDecoration: "none"
            }}
          >
            ← Back to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmergencyReset;
