import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🔍 [APP] Component mounted');

  useEffect(() => {
    console.log('🔍 [APP] Checking for saved user...');
    
    // Check URL params for token (Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
      console.log('✅ [APP] Found OAuth token in URL');
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('✅ [APP] OAuth user logged in:', userData.email);
        // Clean URL
        window.history.replaceState({}, '', '/authstack');
      } catch (error) {
        console.error('❌ [APP] Error parsing OAuth data:', error);
      }
    } else {
      // Check localStorage for existing session
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        console.log('✅ [APP] Found saved session');
        try {
          setUser(JSON.parse(savedUser));
          console.log('✅ [APP] User restored from localStorage');
        } catch (error) {
          console.error('❌ [APP] Error parsing saved user:', error);
          localStorage.clear();
        }
      } else {
        console.log('ℹ️ [APP] No saved session found');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    console.log('✅ [APP] User logged in:', userData.email);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    console.log('👋 [APP] User logged out');
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui'
      }}>
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