import React, { useState } from 'react';
import API from '../api'; 
import './AdminLogin.css';

export function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false); 

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await API.post("/admin/login", {
        username: credentials.username,
        password: credentials.password
      });
      
      if (response.data && response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        window.location.href = "/admin";
      }
    } catch (err) {
      if (err.response) {
        setError(`Error: ${err.response.data.message || "Invalid Admin Credentials"}`);
      } else {
        setError("Network Error: Backend unreachable.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>
        <form onSubmit={handleLogin} className="admin-login-form">
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={credentials.username}
            onChange={handleChange} 
            disabled={isLoading}
            required 
            className="admin-input" 
          />
          
          <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              value={credentials.password}
              onChange={handleChange} 
              disabled={isLoading}
              required 
              className="admin-input" 
              style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} 
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '15px', top: '50%', 
                transform: 'translateY(-50%)', cursor: 'pointer', 
                fontSize: '18px', userSelect: 'none', color: '#666' 
              }}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </span>
          </div>

          {error && <p className="error-message" style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
          
          <button type="submit" className="admin-login-button" disabled={isLoading} style={{ marginTop: '10px' }}>
            {isLoading ? "Checking..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <a 
            href="/emergency-reset" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              fontSize: '12px', 
              color: '#007bff', 
              textDecoration: isHovered ? 'underline' : 'none', 
              transition: '0.2s' 
            }}
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}