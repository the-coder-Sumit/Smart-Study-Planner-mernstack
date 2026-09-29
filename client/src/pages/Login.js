import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import './Auth.css';

function Login() {
  useEffect(() => { googleLogout(); }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/google`, { token: credentialResponse.credential });
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">


      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <span className="box red"></span>
              <span className="box green"></span>
              <span className="box blue"></span>
              <span className="box yellow"></span>
            </div>
            <h2>Smart Study Planner</h2>
          </div>
          <h1 className="login-title">Login</h1>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="email" 
            placeholder="sumit@gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="login-input"
          />
          <input 
            type="password" 
            placeholder="******" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="login-input"
          />
          <div style={{ textAlign: 'right', marginTop: '-5px', marginBottom: '10px' }}>
            <Link to="/forgot-password" style={{ color: '#c4a1ff', fontSize: '13px', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-text">
          New user? <Link to="/register" className="register-link">Register here</Link>
        </p>

        <div className="divider">
          <span>OR</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Sign-In Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;

