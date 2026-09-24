import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLoginApi } from '../../services/apiService';
import { ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import SplitAuthLayout from '../../components/SplitAuthLayout';

export default function AdminLoginPage({ onAdminLoginSuccess, onShowToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await adminLoginApi({ email: email.trim().toLowerCase(), password });
      
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(data.user || data);
      }
      if (onShowToast) {
        onShowToast('success', 'Admin Authenticated', `Welcome to Toyland Admin Control Panel, ${data.name || 'Admin'}!`);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      const friendlyMsg = err.message || 'Invalid admin email or password.';
      setErrorMessage(friendlyMsg);
      if (onShowToast) {
        onShowToast('error', 'Admin Login Failed', friendlyMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout isAdmin={true}>
      <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
        {/* Brand Header */}
        <div className="auth-brand-logo" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
          <span className="toy-accent-icon">🧸</span>
          <span>Toyland Admin</span>
        </div>

        {/* Page Heading */}
        <h1 className="auth-heading" style={{ textAlign: 'left' }}>Admin Login</h1>
        <p className="auth-subtext" style={{ textAlign: 'left' }}>
          Authorized administration access to manage toys, orders, users, and business.
        </p>

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="pure-form" noValidate>
          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="admin-login-email">
              Admin Email
            </label>
            <div className="field-input-wrapper">
              <input
                id="admin-login-email"
                type="email"
                className="field-input"
                placeholder="Enter admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <div className="field-label">
              <label htmlFor="admin-login-password">Password</label>
            </div>
            <div className="field-input-wrapper">
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input has-icon-right"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-submit-primary"
            disabled={loading}
          >
            <span>{loading ? 'Authenticating Admin...' : 'Login to Admin Panel'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Link back to store */}
        <div className="auth-footer-text" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
          <Link to="/login" className="auth-footer-action">
            ← Back to Customer Store Login
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
