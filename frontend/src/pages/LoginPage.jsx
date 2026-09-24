import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginUserApi } from '../services/apiService';
import SplitAuthLayout from '../components/SplitAuthLayout';

export default function LoginPage({ onShowToast, onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success message when redirected from registration
  const successMessage = location.state?.registeredMessage;

  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = 'Please enter a valid email address.';
      }
    }

    if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errEmail = validateField('email', formData.email);
    const errPassword = validateField('password', formData.password);

    if (errEmail || errPassword) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API service (POST http://localhost:8080/api/auth/login)
      const res = await loginUserApi({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      setIsSubmitting(false);

      if (onLoginSuccess) {
        onLoginSuccess(res.user || res);
      }

      if (onShowToast) {
        onShowToast('success', 'Welcome Back!', `Successfully logged in as ${res.name || res.email}`);
      }

      // On successful login -> redirect user to Toyland product home page
      navigate('/home');
    } catch (err) {
      setIsSubmitting(false);
      const friendlyMsg = err.message || 'Invalid email or password. Please try again.';
      setApiError(friendlyMsg);

      if (onShowToast) {
        onShowToast('error', 'Login Failed', friendlyMsg);
      }

      navigate('/login');
    }
  };

  return (
    <SplitAuthLayout>
      <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
        {/* Brand Header */}
        <div className="auth-brand-logo" style={{ justifyContent: 'flex-start' }}>
          <span className="toy-accent-icon">🧸</span>
          <span>Toyland</span>
        </div>

        {/* Page Heading */}
        <h1 className="auth-heading" style={{ textAlign: 'left' }}>Welcome Back!</h1>
        <p className="auth-subtext" style={{ textAlign: 'left' }}>Login to discover amazing toys on Toyland.</p>

        {/* Success Banner when redirected from Registration */}
        {successMessage && !apiError && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
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
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Banner when login fails */}
        {apiError && (
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
            <span>{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="pure-form" noValidate>
          {/* Email */}
          <div className={`field-group ${errors.email ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <div className="field-input-wrapper">
              <input
                id="login-email"
                type="email"
                name="email"
                className="field-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div className="field-error-text">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className={`field-group ${errors.password ? 'is-invalid' : ''}`}>
            <div className="field-label">
              <label htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-pwd-link">
                Forgot Password?
              </Link>
            </div>
            <div className="field-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="field-input has-icon-right"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
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
            {errors.password && (
              <div className="field-error-text">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-submit-primary"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Logging In...' : 'Login'}</span>
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Route to Register */}
        <div className="auth-footer-text" style={{ textAlign: 'left' }}>
          Don't have an account?
          <Link to="/register" className="auth-footer-action">
            Register
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
