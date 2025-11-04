import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for OAuth success in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');

    if (authSuccess === 'success') {
      // Read user data from cookie
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));

      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUser(userData);
          // Clean URL
          window.history.replaceState({}, '', '/authstack');
        } catch (error) {
          // Cookie parse error
        }
      }
    } else {
      // Check if we have user data in cookie (from previous session)
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));

      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUser(userData);
        } catch (error) {
          // Cookie parse error
        }
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    // Store user data in cookie (not sensitive, just for UI)
    document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Strict`;
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/authstack"
          element={user ? <Navigate to="/authstack/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/authstack/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/authstack" />}
        />
        <Route path="/" element={<Navigate to="/authstack" />} />
      </Routes>
    </Router>
  );
}

export default App;
