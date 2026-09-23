import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { resetPasswordApi, validateResetTokenApi } from '../services/apiService';

export default function ResetPasswordPage({ onShowToast }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsTokenValid(false);
        return;
      }
      try {
        const valid = await validateResetTokenApi(token);
        setIsTokenValid(valid);
      } catch (err) {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    checkToken();
  }, [token]);

  const validate = () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return false;
    }
    if (!confirmPassword.trim()) {
      setError('Please confirm your new password.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await resetPasswordApi(token, newPassword);
      setIsResetSuccess(true);

      if (onShowToast) {
        onShowToast('success', 'Password Reset Successful', res.message || 'Password reset successfully!');
      }

      // Automatically redirect to Login page after 2.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'This password reset link is invalid or has expired.');
      if (onShowToast) {
        onShowToast('error', 'Reset Failed', err.message || 'Failed to reset password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="page-container">
        <div className="auth-card-full" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="page-container">
        <div className="auth-card-full" style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertCircle size={32} />
          </div>
          <h1 className="auth-heading" style={{ fontSize: '1.35rem', color: 'var(--primary-navy)' }}>
            Link Invalid or Expired
          </h1>
          <p className="auth-subtext" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            This password reset link is invalid or has expired. Please request a new link to reset your password.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/forgot-password" className="btn-submit-primary" style={{ display: 'inline-flex', width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
              Request New Reset Link
            </Link>
            <Link to="/login" className="auth-footer-action" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
              <ArrowLeft size={16} />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isResetSuccess) {
    return (
      <div className="page-container">
        <div className="auth-card-full" style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={34} />
          </div>
          <h1 className="auth-heading" style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>
            Password Reset Successfully!
          </h1>
          <p className="auth-subtext" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your password has been updated. Redirecting you to the Login page...
          </p>
          <Link to="/login" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.75rem 2rem', textDecoration: 'none', justifyContent: 'center' }}>
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="auth-card-full">
        <div className="auth-brand-logo">
          <span className="toy-accent-icon">🔒</span>
          <span>Toyland</span>
        </div>

        <h1 className="auth-heading">Reset Password</h1>
        <p className="auth-subtext">
          Enter your new password and confirm it below to update your account.
        </p>

        <form onSubmit={handleSubmit} className="pure-form" noValidate>
          <div className={`field-group ${error ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="new-password">
              New Password
            </label>
            <div className="field-input-wrapper">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={`field-group ${error ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="field-input-wrapper">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="field-error-text">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit-primary"
            disabled={isSubmitting}
            style={{ marginTop: '1rem' }}
          >
            <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password'}</span>
            {!isSubmitting && <Lock size={18} />}
          </button>
        </form>

        <div className="auth-footer-text">
          <Link
            to="/login"
            className="auth-footer-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
