import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginApi } from '../../services/apiService';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage({ onAdminLoginSuccess, onShowToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await adminLoginApi({ email, password });
      
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(data);
      }
      if (onShowToast) {
        onShowToast('success', 'Admin Authenticated', `Welcome to Toyland Admin Control Panel, ${data.name || 'Admin'}!`);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid admin email or password.');
      if (onShowToast) {
        onShowToast('error', 'Admin Login Failed', err.message || 'Invalid admin email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-card-full" style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(36, 59, 107, 0.08)', padding: '2.5rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#FFFFFF' }}>
            <ShieldCheck size={32} />
          </div>
          <div className="auth-brand-logo" style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', fontWeight: 800 }}>
            🧸 Toyland Admin
          </div>
          <h2 className="auth-heading" style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', margin: '0.2rem 0' }}>
            Control Panel Login
          </h2>
          <p className="auth-subtext" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Authorized administration access only
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #FCA5A5',
            fontWeight: 500
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pure-form">
          <div className="field-group">
            <label className="field-label" style={{ color: 'var(--primary-navy)' }}>Admin Email</label>
            <div className="field-input-wrapper">
              <input
                type="email"
                className="field-input"
                placeholder="admin@toyland.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" style={{ color: 'var(--primary-navy)' }}>Password</label>
            <div className="field-input-wrapper">
              <input
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-primary"
            disabled={loading}
            style={{ marginTop: '0.8rem', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            <span>{loading ? 'Authenticating Admin...' : 'Login to Admin Panel'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
          <a href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Customer Store Login
          </a>
        </div>
      </div>
    </div>
  );
}
