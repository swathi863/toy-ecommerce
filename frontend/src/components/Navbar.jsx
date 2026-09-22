import React from 'react';
import { ShoppingBag, Search, Sun, Moon, LogIn, UserPlus, User, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({
  user,
  cartCount,
  theme,
  toggleTheme,
  onOpenAuth,
  onOpenProfile,
  onLogout
}) {
  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <a href="#" className="logo">
          <div className="logo-badge">
            <Sparkles size={22} />
          </div>
          <span>ToyLand</span>
        </a>

        {/* Search Bar */}
        <div className="nav-search">
          <Search className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search action figures, Lego, plushies & games..."
          />
        </div>

        {/* Right Navigation Actions */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Cart Icon Badge */}
          <button
            className="icon-btn"
            title="Shopping Cart"
            aria-label="View Cart"
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              }
            }}
          >
            <ShoppingBag size={20} />
            <span className="cart-count">{cartCount}</span>
          </button>

          {/* Auth State: Logged In vs Logged Out */}
          {user ? (
            <div className="user-badge" onClick={onOpenProfile} title="View Account Details">
              <div className="avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-badge-name">{user.name || user.email}</span>
            </div>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={18} />
                <span>Log In</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onOpenAuth('register')}
              >
                <UserPlus size={18} />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
