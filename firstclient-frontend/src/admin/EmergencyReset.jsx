import React, { useState } from 'react';
import axios from 'axios';

const EmergencyReset = () => {
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Separate states for each eye toggle
  const [showKey, setShowKey] = useState(false); 
  const [showPass, setShowPass] = useState(false);
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false); 

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/admin/emergency-reset', {
        recoveryKey,
        newPassword
      });
      
      setStatus({ 
        type: 'success', 
        message: '✅ Success! Password updated. Redirecting to login...' 
      });

      setRecoveryKey('');
      setNewPassword('');

      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 3000);

    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || '❌ Reset failed. Please check your Master Key.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input style for consistency
  const inputStyle = {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  };

  const iconStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '18px',
    userSelect: 'none',
    opacity: 0.7
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '10px' }}>🛡️ Emergency Reset</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Enter your Master Key to update the Admin password.</p>
      
      <form onSubmit={handleReset}>
        
        {/* 1. Recovery Key Input with Eye */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
          <input 
            type={showKey ? "text" : "password"} 
            placeholder="Master Recovery Key" 
            value={recoveryKey} 
            onChange={(e) => setRecoveryKey(e.target.value)} 
            required
            style={inputStyle}
          />
          <span onClick={() => setShowKey(!showKey)} style={iconStyle}>
            {showKey ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>
        
        {/* 2. New Password Input with Eye */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
          <input 
            type={showPass ? "text" : "password"} 
            placeholder="New Admin Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required
            style={inputStyle}
          />
          <span onClick={() => setShowPass(!showPass)} style={iconStyle}>
            {showPass ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', padding: '12px', background: isLoading ? '#666' : '#000', color: '#fff', 
            border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px'
          }}
        >
          {isLoading ? "Processing..." : "Update Admin Password"}
        </button>
      </form>

      {status.message && (
        <div style={{ 
          marginTop: '20px', padding: '10px', borderRadius: '6px', 
          backgroundColor: status.type === 'success' ? '#e6fffa' : '#fff5f5',
          color: status.type === 'success' ? '#2c7a7b' : '#c53030',
          border: `1px solid ${status.type === 'success' ? '#81e6d9' : '#feb2b2'}`,
          fontSize: '14px'
        }}>
          {status.message}
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <a 
          href="/admin/login" 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            fontSize: '12px', 
            color: '#007bff', 
            textDecoration: isHovered ? 'underline' : 'none', 
            transition: '0.2s' 
          }}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default EmergencyReset;