import React from 'react';
import { Link } from 'react-router-dom';

export default function SplitAuthLayout({ children, isAdmin = false }) {
  return (
    <div className="auth-page-container">
      {/* TOP NAVBAR */}
      <header className="auth-top-navbar">
        <div className="auth-navbar-brand">
          <Link to="/" className="auth-brand-link">
            <span className="auth-brand-emoji">🧸</span>
            <span className="auth-brand-text">Toyland</span>
          </Link>
        </div>

        <div className="auth-navbar-action">
          <Link to={isAdmin ? "/admin" : "/login"} className="auth-signin-link">
            {isAdmin ? "Admin Sign In" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* CENTERED AUTHENTICATION CARD */}
      <main className="auth-card-wrapper">
        <div className="auth-split-card">
          {/* LEFT SIDE (50%): Complete Toyland Image */}
          <div className="auth-card-left-image auth-image-section">
            <img
              src="https://ik.imagekit.io/StringStackSwathi/Educational/Educational/main.png"
              alt="Toyland - Small Toys Big Smiles"
              className="auth-card-img auth-toy-image"
            />
          </div>

          {/* RIGHT SIDE (50%): Existing Page Form */}
          <div className="auth-card-right-form">
            <div className="auth-form-container">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




