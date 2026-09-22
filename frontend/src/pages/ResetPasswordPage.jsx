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

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsTokenValid(false);
        return;
      }
      const valid = await validateResetTokenApi(token);
      setIsTokenValid(valid);
      setIsValidating(false);
    };
    checkToken();
  }, [token]);

  const validate = () => {
    if (!newPassword) {
      setError('New password is required.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
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
      if (onShowToast) {
        onShowToast('success', 'Password Reset Successful', res.message || 'Password updated successfully! Please login with your new password.');
      }
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Token may have expired.');
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Validating password reset token...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="page-container">
        <div className="auth-card-full" style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertCircle size={30} />
          </div>
          <h1 className="auth-heading" style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>
            Invalid or Expired Reset Link
          </h1>
          <p className="auth-subtext" style={{ marginBottom: '1.5rem' }}>
            This password reset link is invalid or has expired (links expire after 30 minutes). Please request a new reset link.
          </p>
          <Link to="/forgot-password" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Request New Reset Link
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
          Enter a new password for your Toyland account.
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
              Confirm New Password
            </label>
            <div className="field-input-wrapper">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Confirm new password"
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
          >
            <span>{isSubmitting ? 'Resetting Password...' : 'Update & Reset Password'}</span>
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
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
