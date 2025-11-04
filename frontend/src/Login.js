import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://vijayg.dev/authstack/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

function Login({ onLogin }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;
      if (authMethod === 'password') {
        response = await axios.post(`${API_BASE}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
      }
      else if (authMethod === 'register') {
        response = await axios.post(`${API_BASE}/auth/register`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        });
      }
      else if (authMethod === 'otp') {
        if (!otpSent) {
          await axios.post(`${API_BASE}/auth/send-otp`, {
            email: formData.email
          });
          setOtpSent(true);
          setMessage('✅ OTP sent to your email!');
          setLoading(false);
          return;
        } else {
          response = await axios.post(`${API_BASE}/auth/verify-otp`, {
            email: formData.email,
            otp: formData.otp
          });
        }
      }

      if (response?.data?.success) {
        setMessage('✅ Login successful!');
        // Token is now in httpOnly cookie, just pass user data
        onLogin(response.data.user);
      } else {
        setMessage('❌ ' + (response?.data?.message || 'Login failed'));
      }

    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const resetOtp = () => {
    setOtpSent(false);
    setFormData({ ...formData, otp: '' });
    setMessage('');
  };

  const switchMethod = (method) => {
    setAuthMethod(method);
    setFormData({ firstName: '', lastName: '', email: '', password: '', otp: '' });
    setMessage('');
    setOtpSent(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome
          </h1>
          <p className="text-gray-600 text-base">
            Sign in to your account
          </p>
        </div>

        {/* Method Tabs */}
        <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
          {[
            { key: 'password', label: 'Password' },
            { key: 'otp', label: 'Email OTP' },
            { key: 'register', label: 'Register' }
          ].map(method => (
            <button
              key={method.key}
              onClick={() => switchMethod(method.key)}
              className={`flex-1 py-2 px-3 border-none rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 ${
                authMethod === method.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Registration Fields */}
          {authMethod === 'register' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base outline-none transition-colors duration-200 focus:border-primary-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base outline-none transition-colors duration-200 focus:border-primary-500"
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
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base mb-4 outline-none transition-colors duration-200 focus:border-primary-500"
          />

          {/* Password */}
          {(authMethod === 'password' || authMethod === 'register') && (
            <div className="mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base mb-2 outline-none transition-colors duration-200 focus:border-primary-500"
              />
              {authMethod === 'register' && (
                <p className="text-xs text-gray-500 mb-2">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPasswordCheckbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="showPasswordCheckbox"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Show Password
                </label>
              </div>
            </div>
          )}

          {/* OTP */}
          {authMethod === 'otp' && otpSent && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                required
                maxLength="6"
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base text-center tracking-wider outline-none transition-colors duration-200 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={resetOtp}
                className="mt-2 bg-transparent border-none text-primary-500 text-sm cursor-pointer underline"
              >
                Change email or resend OTP
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-white border-none rounded-lg text-base font-semibold transition-colors duration-200 mb-4 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 cursor-pointer'
            }`}
          >
            {loading ? 'Please wait...' :
             authMethod === 'register' ? 'Create Account' :
             authMethod === 'otp' && !otpSent ? 'Send OTP' :
             authMethod === 'otp' && otpSent ? 'Verify OTP' :
             'Sign In'}
          </button>
        </form>

        {/* Google Login */}
        <div className="text-center mb-5">
          <div className="flex items-center my-5 text-gray-400">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-lg text-base font-medium cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 hover:border-primary-500"
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
          <div className={`py-3 px-4 rounded-lg text-sm text-center font-medium ${
            message.includes('❌')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
