import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function HeaderNavbar() {
  const location = useLocation();

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link to="/register" className="nav-brand">
          <div className="nav-brand-icon">
            <Sparkles size={20} />
          </div>
          <span>Toyland</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/login"
            className={`nav-tab-btn ${location.pathname === '/login' ? 'active' : ''}`}
          >
            Login (/login)
          </Link>
          <Link
            to="/register"
            className={`nav-tab-btn ${location.pathname === '/register' ? 'active' : ''}`}
          >
            Register (/register)
          </Link>
        </nav>
      </div>
    </header>
  );
}
