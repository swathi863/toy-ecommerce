import React, { useState } from 'react';
import { X, User, Mail, Shield, Key, Copy, Check, LogOut, Code, Calendar } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user, token, onLogout, onShowToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      if (onShowToast) {
        onShowToast('info', 'Copied!', 'JWT Token copied to clipboard');
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-header" style={{ paddingBottom: '0.5rem' }}>
          <div
            className="avatar-circle"
            style={{
              width: 64,
              height: 64,
              fontSize: '1.8rem',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="modal-title">{user.name}</h2>
          <p className="modal-subtitle">{user.email}</p>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* User Details Grid */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              fontSize: '0.88rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>USER ID</span>
              <strong style={{ color: 'var(--text-primary)' }}>#{user.user_id || 101}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>ROLE</span>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}
              >
                {user.role || 'ROLE_USER'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>ACCOUNT CREATED</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                {new Date(user.created || Date.now()).toLocaleDateString()}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>AUTH STATUS</span>
              <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.82rem' }}>
                ● JWT Active
              </span>
            </div>
          </div>

          {/* JWT Token Preview Box */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={14} color="var(--brand-primary)" />
                JWT Token (Stored in `jwt_tokens` table)
              </span>
              <button
                type="button"
                onClick={handleCopyToken}
                style={{
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>

            <div className="payload-card" style={{ marginTop: 0, maxHeight: '100px', overflowY: 'auto' }}>
              <code>{token || 'No active JWT token'}</code>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="btn btn-secondary btn-full"
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
