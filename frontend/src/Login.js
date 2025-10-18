import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

function Login({ onLogin, oauthError }) {
  const [authMethod, setAuthMethod] = useState('password'); // 'password', 'otp', 'register'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  console.log('🔍 [LOGIN] Component rendered, method:', authMethod);

  useEffect(() => {
    if (oauthError) {
      setMessage('❌ ' + oauthError);
    }
  }, [oauthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    console.log('🔄 [LOGIN] Form submitted, method:', authMethod);

    try {
      let response;
      
      if (authMethod === 'password') {
        console.log('🔐 [LOGIN] Attempting email/password login:', formData.email);
        response = await axios.post(`${API_BASE}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
      } 
      else if (authMethod === 'register') {
        console.log('📝 [LOGIN] Attempting registration:', formData.email);
        response = await axios.post(`${API_BASE}/auth/register`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        });
      }
      else if (authMethod === 'otp') {
        if (!otpSent) {
          console.log('📨 [LOGIN] Sending OTP to:', formData.email);
          await axios.post(`${API_BASE}/auth/send-otp`, {
            email: formData.email
          });
          setOtpSent(true);
          setMessage('✅ OTP sent to your email!');
          setLoading(false);
          return;
        } else {
          console.log('🔍 [LOGIN] Verifying OTP for:', formData.email);
          response = await axios.post(`${API_BASE}/auth/verify-otp`, {
            email: formData.email,
            otp: formData.otp
          });
        }
      }

      if (response?.data?.success) {
        console.log('✅ [LOGIN] Success:', response.data.user.email);
        setMessage('✅ Login successful!');
        onLogin(response.data.user, response.data.token);
      } else {
        console.log('❌ [LOGIN] Failed:', response?.data?.message);
        setMessage('❌ ' + (response?.data?.message || 'Login failed'));
      }

    } catch (error) {
      console.error('❌ [LOGIN] Error:', error.response?.data?.message || error.message);
      setMessage('❌ ' + (error.response?.data?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('🔄 [LOGIN] Initiating Google OAuth');
    window.location.href = `${API_BASE}/auth/google`;
  };

  const resetOtp = () => {
    console.log('🔄 [LOGIN] Resetting OTP form');
    setOtpSent(false);
    setFormData({ ...formData, otp: '' });
    setMessage('');
  };

  const switchMethod = (method) => {
    console.log('🔄 [LOGIN] Switching to method:', method);
    setAuthMethod(method);
    setFormData({ firstName: '', lastName: '', email: '', password: '', otp: '' });
    setMessage('');
    setOtpSent(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '480px'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#1a202c'
          }}>
            Welcome
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#718096',
            fontSize: '16px'
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Method Tabs */}
        <div style={{
          display: 'flex',
          background: '#f7fafc',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          {[
            { key: 'password', label: 'Password' },
            { key: 'otp', label: 'Email OTP' },
            { key: 'register', label: 'Register' }
          ].map(method => (
            <button
              key={method.key}
              onClick={() => switchMethod(method.key)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: authMethod === method.key ? '#667eea' : 'transparent',
                color: authMethod === method.key ? 'white' : '#4a5568',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Registration Fields */}
          {authMethod === 'register' && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />

          {/* Password */}
          {(authMethod === 'password' || authMethod === 'register') && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="showPasswordCheckbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <label 
                  htmlFor="showPasswordCheckbox"
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Show Password
                </label>
              </div>
            </div>
          )}

          {/* OTP */}
          {authMethod === 'otp' && otpSent && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                required
                maxLength="6"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="button"
                onClick={resetOtp}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Change email or resend OTP
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Please wait...' : 
             authMethod === 'register' ? 'Create Account' :
             authMethod === 'otp' && !otpSent ? 'Send OTP' :
             authMethod === 'otp' && otpSent ? 'Verify OTP' :
             'Sign In'}
          </button>
        </form>

        {/* Google Login */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '20px 0',
            color: '#a0aec0'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ padding: '0 16px', fontSize: '14px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
            onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: message.includes('❌') ? '#fed7d7' : '#c6f6d5',
            color: message.includes('❌') ? '#c53030' : '#2f855a',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;