import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage({ onShowToast }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      if (onShowToast) {
        onShowToast('success', 'Reset Link Sent', `Password reset instructions sent to ${email}`);
      }
    }, 600);
  };

  return (
    <div className="page-container">
      <div className="auth-card-full">
        <div className="auth-brand-logo">
          <span className="toy-accent-icon">🔑</span>
          <span>Toyland</span>
        </div>

        <h1 className="auth-heading">Forgot Password</h1>
        <p className="auth-subtext">
          Enter your registered email to receive a password reset link.
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="pure-form" noValidate>
            <div className={`field-group ${error ? 'is-invalid' : ''}`}>
              <label className="field-label" htmlFor="reset-email">
                Email
              </label>
              <div className="field-input-wrapper">
                <input
                  id="reset-email"
                  type="email"
                  className="field-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
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
              <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>
              Instructions Sent!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Check your inbox at <strong>{email}</strong>
            </p>
          </div>
        )}

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
