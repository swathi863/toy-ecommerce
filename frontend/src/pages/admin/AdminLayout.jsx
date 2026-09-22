import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, TrendingUp, LogOut, Shield, ChevronRight } from 'lucide-react';

export default function AdminLayout({ user, onLogout, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Role Protection Guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: '500px', margin: '4rem auto', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Shield size={36} />
        </div>
        <h2 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          You do not have permission to access the admin panel. Admin credentials are required.
        </p>
        <Link to="/admin" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
          Go to Admin Login
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Business', path: '/admin/business', icon: TrendingUp },
  ];

  const handleLogoutClick = async () => {
    if (onLogout) await onLogout();
    navigate('/admin');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#243B6B',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.6rem' }}>🧸</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '0.3px' }}>Toyland Admin</div>
            <div style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Control Panel</div>
          </div>
        </div>

        {/* User Info Card */}
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', margin: '1rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: 700 }}>Authenticated Admin</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name || user.userName || 'Admin User'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ flex: 1, padding: '0.5rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  backgroundColor: isActive ? '#F59E0B' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={19} color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} color="#FFFFFF" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div style={{ padding: '1rem 0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
