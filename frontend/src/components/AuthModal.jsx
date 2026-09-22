import React, { useEffect } from 'react';
import { X, LogIn, UserPlus, KeyRound, Sparkles } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function AuthModal({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onAuthSuccess,
  onShowToast
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-icon">
            {activeTab === 'login' && <LogIn size={26} />}
            {activeTab === 'register' && <UserPlus size={26} />}
            {activeTab === 'forgot' && <KeyRound size={26} />}
          </div>
          <h2 className="modal-title">
            {activeTab === 'login' && 'Welcome Back'}
            {activeTab === 'register' && 'Join Toyland'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="modal-subtitle">
            {activeTab === 'login' && 'Log in to manage your cart, orders & toy wishlist'}
            {activeTab === 'register' && 'Create an account to explore premium toys & rewards'}
            {activeTab === 'forgot' && 'We will help you recover access to your account'}
          </p>
        </div>

        {/* Modal Tab Switcher */}
        {activeTab !== 'forgot' && (
          <div className="modal-tabs">
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="modal-body">
          {activeTab === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setActiveTab('register')}
              onForgotPassword={() => setActiveTab('forgot')}
              onSuccess={(authPayload) => {
                onAuthSuccess(authPayload);
                onShowToast('success', 'Welcome Back!', `Logged in successfully as ${authPayload.user.email}`);
              }}
            />
          )}

          {activeTab === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setActiveTab('login')}
              onSuccess={(userPayload) => {
                onShowToast(
                  'success',
                  'Registration Successful!',
                  `Account created for ${userPayload.name}. You can now log in.`
                );
                // Switch to login tab after brief moment
                setTimeout(() => setActiveTab('login'), 1800);
              }}
            />
          )}

          {activeTab === 'forgot' && (
            <ForgotPasswordForm
              onBackToLogin={() => setActiveTab('login')}
              onShowToast={onShowToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}
