import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft
} from 'lucide-react';

import {
  resetPasswordApi,
  validateResetTokenApi
} from '../services/apiService';
import SplitAuthLayout from '../components/SplitAuthLayout';

export default function ResetPasswordPage({ onShowToast }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get reset token from: /reset-password?token=TOKEN
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
        setIsTokenValid(Boolean(valid));
      } catch (err) {
        console.error('Reset token validation error:', err);
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

    if (!token) {
      setError('Missing reset token.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await resetPasswordApi(token, newPassword);

      setIsResetSuccess(true);

      if (onShowToast) {
        onShowToast(
          'success',
          'Password Reset Successfully!',
          res.message || 'Your password has been reset. Redirecting to login...'
        );
      }

      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredMessage: 'Password reset successfully! Please log in with your new password.'
          }
        });
      }, 2500);
    } catch (err) {
      setError(
        err.message ||
        'Failed to reset password. The link might be invalid or expired.'
      );

      if (onShowToast) {
        onShowToast(
          'error',
          'Reset Failed',
          err.message || 'Unable to reset password.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <SplitAuthLayout>
        <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0, textAlign: 'left' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid #e5e7eb',
              borderTopColor: '#243B6B',
              borderRadius: '50%',
              margin: '2rem 0 1.25rem',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Validating reset link...
          </p>
        </div>
      </SplitAuthLayout>
    );
  }

  if (!isTokenValid) {
    return (
      <SplitAuthLayout>
        <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={32} />
          </div>

          <h1 className="auth-heading" style={{ textAlign: 'left', fontSize: '1.35rem' }}>
            Link Invalid or Expired
          </h1>

          <p className="auth-subtext" style={{ textAlign: 'left', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            This password reset link is invalid or expired. Please request a new link to reset your password.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Link
              to="/forgot-password"
              className="btn-submit-primary"
              style={{ display: 'inline-flex', width: '100%', textDecoration: 'none', justifyContent: 'center' }}
            >
              Request New Reset Link
            </Link>

            <Link
              to="/login"
              className="auth-footer-action"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 0, marginTop: '0.5rem' }}
            >
              <ArrowLeft size={16} />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      </SplitAuthLayout>
    );
  }

  if (isResetSuccess) {
    return (
      <SplitAuthLayout>
        <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <CheckCircle2 size={34} />
          </div>

          <h1 className="auth-heading" style={{ textAlign: 'left', fontSize: '1.4rem' }}>
            Password Reset Successfully!
          </h1>

          <p className="auth-subtext" style={{ textAlign: 'left', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your password has been updated successfully. Redirecting you to the Login page...
          </p>

          <Link
            to="/login"
            className="btn-submit-primary"
            style={{
              display: 'inline-flex',
              width: 'auto',
              padding: '0.75rem 2rem',
              textDecoration: 'none',
              justifyContent: 'center'
            }}
          >
            Go to Login Now
          </Link>
        </div>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout>
      <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
        {/* Brand Header */}
        <div className="auth-brand-logo" style={{ justifyContent: 'flex-start' }}>
          <span className="toy-accent-icon">🔒</span>
          <span>Toyland</span>
        </div>

        <h1 className="auth-heading" style={{ textAlign: 'left' }}>Reset Password</h1>
        <p className="auth-subtext" style={{ textAlign: 'left' }}>Enter your new password below.</p>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pure-form" noValidate>
          {/* New Password */}
          <div className={`field-group ${error && !newPassword ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="reset-new-password">
              New Password
            </label>

            <div className="field-input-wrapper">
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input has-icon-right"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
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
          </div>

          {/* Confirm Password */}
          <div className={`field-group ${error && confirmPassword !== newPassword ? 'is-invalid' : ''}`}>
            <label className="field-label" htmlFor="reset-confirm-password">
              Confirm Password
            </label>

            <div className="field-input-wrapper">
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input has-icon-right"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
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

            {confirmPassword && confirmPassword === newPassword && (
              <div className="field-success-text" style={{ marginTop: '0.4rem' }}>
                <CheckCircle2 size={14} />
                <span>Passwords match!</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit-primary"
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            <span>{isSubmitting ? 'Updating Password...' : 'Reset Password'}</span>
            <Lock size={18} />
          </button>
        </form>

        <div className="auth-footer-text" style={{ textAlign: 'left' }}>
          <Link
            to="/login"
            className="auth-footer-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 0 }}
          >
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}