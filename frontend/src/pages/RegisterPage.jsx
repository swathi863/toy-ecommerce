import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { registerUserApi } from '../services/apiService';
import SplitAuthLayout from '../components/SplitAuthLayout';

export default function RegisterPage({ onShowToast }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field level validation
  const validateField = (name, value) => {
    let error = '';

    if (name === 'name') {
      if (!value.trim()) {
        error = 'Full Name is required.';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters.';
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = 'Please enter a valid email address (e.g. alex@example.com).';
      }
    }

    if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters long.';
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== formData.password) {
        error = 'Passwords do not match.';
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errName = validateField('name', formData.name);
    const errEmail = validateField('email', formData.email);
    const errPassword = validateField('password', formData.password);
    const errConfirm = validateField('confirmPassword', formData.confirmPassword);

    if (errName || errEmail || errPassword || errConfirm) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUserApi({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      setIsSubmitting(false);

      if (onShowToast) {
        onShowToast('success', 'Account Created!', 'Your account has been created successfully! Please log in.');
      }

      navigate('/login', { state: { registeredMessage: 'Account created successfully! Please log in.' } });
    } catch (err) {
      setIsSubmitting(false);
      const friendlyMsg = err.message || 'Registration failed. Please check your details and try again.';
      setApiError(friendlyMsg);

      if (onShowToast) {
        onShowToast('error', 'Registration Failed', friendlyMsg);
      }

      navigate('/register');
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
        <h1 className="auth-heading" style={{ textAlign: 'left' }}>Create Your Account</h1>
        <p className="auth-subtext" style={{ textAlign: 'left' }}>Join Toyland and discover a world of fun!</p>

        {/* Error Banner when registration fails */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="pure-form" noValidate>
          {/* Name */}
          <div className={`field-group ${errors.name ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="reg-name">
              Name
            </label>
            <div className="field-input-wrapper">
              <input
                id="reg-name"
                type="text"
                name="name"
                className="field-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <div className="field-error-text">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className={`field-group ${errors.email ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="reg-email">
              Email
            </label>
            <div className="field-input-wrapper">
              <input
                id="reg-email"
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
            <label className="field-label" htmlFor="reg-password">
              Password
            </label>
            <div className="field-input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="field-input has-icon-right"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className={`field-group ${errors.confirmPassword ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="reg-confirm-password">
              Confirm Password
            </label>
            <div className="field-input-wrapper">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="field-input has-icon-right"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <div className="field-error-text">
                <AlertCircle size={14} />
                <span>{errors.confirmPassword}</span>
              </div>
            ) : (
              formData.confirmPassword &&
              formData.confirmPassword === formData.password && (
                <div className="field-success-text">
                  <CheckCircle2 size={14} />
                  <span>Passwords match!</span>
                </div>
              )
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="btn-submit-primary"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Route to Login */}
        <div className="auth-footer-text" style={{ textAlign: 'left' }}>
          Already have an account?
          <Link to="/login" className="auth-footer-action">
            Login
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
