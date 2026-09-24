import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import './Auth.css';

const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const LogoIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>;

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      setMessage(res.data.message + ' Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return 'Reset Password 🔒';
    if (step === 2) return 'Verify Code ✉️';
    return 'New Password 🔑';
  };

  const getStepSubtitle = () => {
    if (step === 1) return "Enter your email to receive an OTP";
    if (step === 2) return `Enter the 6-digit code sent to ${email}`;
    return 'Choose a strong password for your account';
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* Left Side */}
        <div className="auth-left">
          <div>
            <div className="logo">
              <LogoIcon /> SMARTPLANNER
            </div>
            <h1>Account Recovery</h1>
            <p>Don't worry, it happens to the best of us. Follow the simple steps to securely regain access to your account.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>2</div>
            <div className="step-line"></div>
            <div className={`step-dot ${step === 3 ? 'active' : ''}`}>3</div>
          </div>

          <div className="auth-header">
            <h2>{getStepTitle()}</h2>
            <p>{getStepSubtitle()}</p>
          </div>

          {error && <div className="error-msg">{error}</div>}
          {message && <div className="success-msg">{message}</div>}
          
          {/* Step 1: Send OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="icon"><MailIcon /></span>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>Verification Code</label>
                <div className="input-wrapper">
                  <span className="icon" style={{fontWeight: 'bold', fontSize: '18px'}}>#</span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength="6"
                    style={{ letterSpacing: '4px', paddingLeft: '40px', fontWeight: '600' }}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>New Password</label>
                <div className="input-wrapper">
                  <span className="icon"><LockIcon /></span>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    minLength="6"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          
          <Link to="/" className="btn-outline" style={{marginTop: '10px'}}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
