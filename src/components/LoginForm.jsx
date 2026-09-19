import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister, onForgotPassword, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required to log in.';
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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const eEmail = validateField('email', formData.email);
    const ePassword = validateField('password', formData.password);

    if (eEmail || ePassword) {
      return;
    }

    setIsSubmitting(true);

    // Simulate login request to Spring Boot
    setTimeout(() => {
      setIsSubmitting(false);

      const mockPayload = {
        email: formData.email.trim().toLowerCase(),
        password: "[SECRET - Authenticated via Spring Security]",
        rememberMe: formData.rememberMe,
        timestamp: new Date().toISOString()
      };

      setSubmittedData(mockPayload);

      if (onSuccess) {
        onSuccess({
          user: {
            user_id: 101,
            name: formData.email.split('@')[0].toUpperCase(),
            email: formData.email.trim().toLowerCase(),
            role: 'ROLE_USER',
            created: new Date().toISOString()
          },
          token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QHRveWxhbmQuY29tIiwiaWF0IjoxNzI2Njk5MjAwLCJleHAiOjE3MjY3ODU2MDB9.MockJwtTokenPayloadForToyEcommerce"
        });
      }
    }, 700);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Email Field */}
        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label className="form-label" htmlFor="login-email">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <div className="form-label">
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              className="forgot-link"
              onClick={onForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="form-row-between">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Submit Login Button */}
        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={isSubmitting}
          style={{ marginTop: '0.5rem' }}
        >
          {isSubmitting ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Registration */}
      <div className="form-footer-link">
        Don't have an account yet?
        <button type="button" onClick={onSwitchToRegister}>
          Create an Account
        </button>
      </div>

      {/* Payload Simulator Card */}
      {submittedData && (
        <div className="payload-card">
          <div className="payload-title">
            <span>Authentication Request Payload</span>
            <span className="payload-badge">POST /api/auth/login</span>
          </div>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
