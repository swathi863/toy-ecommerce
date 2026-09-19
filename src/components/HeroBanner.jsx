import React from 'react';
import { UserPlus, Sparkles, ShieldCheck, Truck, Star } from 'lucide-react';

export default function HeroBanner({ onOpenAuth, isLoggedIn }) {
  return (
    <section className="hero">
      <div className="hero-bg-shapes">
        <div className="shape-blob-1" />
        <div className="shape-blob-2" />
      </div>

      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Premium Toy E-Commerce Store</span>
          </div>
          <h1 className="hero-title">
            Unlock the Magic of <span>Playtime & Adventure</span>
          </h1>
          <p className="hero-description">
            Discover thousands of handpicked educational toys, action figures, plushies, and STEM building sets. Create your account to start shopping!
          </p>

          <div className="hero-ctas">
            {!isLoggedIn ? (
              <>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => onOpenAuth('register')}
                >
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => onOpenAuth('login')}
                >
                  <span>Log In to Shop</span>
                </button>
              </>
            ) : (
              <a href="#catalog" className="btn btn-primary btn-lg">
                <Sparkles size={20} />
                <span>Explore Toy Collection</span>
              </a>
            )}
          </div>
        </div>

        <div className="hero-banner-card">
          <div className="hero-banner-image">🧸🚀🤖</div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              World of Wonders
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Safe, certified & endlessly fun toys for all age groups
            </p>
          </div>

          <div className="hero-features">
            <div className="hero-feature-item">
              <strong>4.9 ★</strong>
              <span>50k+ Reviews</span>
            </div>
            <div className="hero-feature-item">
              <strong>100%</strong>
              <span>Safe & Non-toxic</span>
            </div>
            <div className="hero-feature-item">
              <strong>Fast</strong>
              <span>Global Express</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
