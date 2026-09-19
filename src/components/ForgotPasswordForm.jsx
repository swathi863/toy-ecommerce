import React, { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordForm({ onBackToLogin, onShowToast }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
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
        onShowToast('success', 'Reset Link Sent', `Password reset link sent to ${email}`);
      }
    }, 600);
  };

  return (
    <div className="auth-form-container">
      {!isSent ? (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <p className="modal-subtitle" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Enter the email address associated with your account, and we will send you instructions to reset your password.
            </p>
          </div>

          <div className={`form-group ${error ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="reset-email">
              Registered Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="reset-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>
            {error && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '0.75rem' }}
          >
            {isSubmitting ? (
              <span>Sending instructions...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3 className="modal-title" style={{ fontSize: '1.3rem' }}>
            Check your inbox
          </h3>
          <p className="modal-subtitle" style={{ margin: '0.5rem 0 1.5rem' }}>
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
        </div>
      )}

      <div className="form-footer-link" style={{ marginTop: '1.25rem' }}>
        <button
          type="button"
          onClick={onBackToLogin}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}
