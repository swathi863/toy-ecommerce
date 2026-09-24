import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { forgotPasswordApi } from '../services/apiService';
import SplitAuthLayout from '../components/SplitAuthLayout';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await forgotPasswordApi(email.trim());
      setIsSent(true);
      if (onShowToast) {
        onShowToast('success', 'Reset Link Sent', res.message || `Password reset instructions sent to ${email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
      if (onShowToast) {
        onShowToast('error', 'Request Failed', err.message || 'Failed to send reset email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Secure Account Recovery"
      subtitle="Enter your email to receive a instant password reset link and regain access to Toyland!"
      imageSrc="https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg"
      badgeEmoji="🔑"
    >
      <div className="auth-card-full" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
        <div className="auth-brand-logo" style={{ justifyContent: 'flex-start' }}>
          <span className="toy-accent-icon">🔑</span>
          <span>Toyland</span>
        </div>

        <h1 className="auth-heading" style={{ textAlign: 'left' }}>Forgot Password</h1>
        <p className="auth-subtext" style={{ textAlign: 'left' }}>
          Enter your registered email address to receive a password reset link.
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="pure-form" noValidate>
            <div className={`field-group ${error ? 'is-invalid' : ''}`}>
              <label className="field-label" htmlFor="reset-email">
                Email Address
              </label>
              <div className="field-input-wrapper">
                <input
                  id="reset-email"
                  type="email"
                  className="field-input"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
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
              <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'left', margin: '1.5rem 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 0 1rem'
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <p style={{ color: 'var(--primary-navy)', fontSize: '1.05rem', fontWeight: 800 }}>
              Password Reset Link Sent!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Check your inbox at <strong style={{ color: 'var(--primary-navy)' }}>{email}</strong> for instructions to reset your password.
            </p>
          </div>
        )}

        <div className="auth-footer-text" style={{ textAlign: 'left' }}>
          <Link
            to="/login"
            className="auth-footer-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 0 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
