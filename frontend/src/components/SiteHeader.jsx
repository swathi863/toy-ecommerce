import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, LogOut, User as UserIcon, Package } from 'lucide-react';

export default function SiteHeader({ user, cartItemCount, onSearch, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const getUserDisplayName = (usr) => {
    if (!usr) return '';
    if (usr.name && usr.name.trim()) return usr.name;
    if (usr.userName && usr.userName.trim()) return usr.userName;
    if (usr.email) {
      const namePart = usr.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return '';
  };

  const displayName = getUserDisplayName(user);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Left: Toyland Logo */}
        <Link to="/home" className="header-brand">
          <span className="brand-emoji">🧸</span>
          <span className="brand-name">Toyland</span>
        </Link>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="header-search">
          <Search className="header-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search Toys..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
          />
        </form>

        {/* Right: Actions */}
        <div className="header-actions">
          {/* Cart Icon */}
          <Link to="/cart" className="header-icon-link" title="View Shopping Cart">
            <ShoppingBag size={22} />
            {cartItemCount > 0 && <span className="cart-badge-count">{cartItemCount}</span>}
          </Link>

          {/* Separate User Name Display */}
          {user ? (
            <div className="user-profile-btn" style={{ cursor: 'default' }}>
              <UserIcon size={20} />
              <span>{displayName}</span>
            </div>
          ) : (
            <Link to="/login" className="user-profile-btn" style={{ textDecoration: 'none' }}>
              <UserIcon size={20} />
              <span>Login</span>
            </Link>
          )}

          {/* Separate My Orders Navigation Link */}
          {user && (
            <Link to="/orders" className="header-nav-link" title="My Orders">
              <Package size={18} />
              <span>My Orders</span>
            </Link>
          )}

          {/* Separate Logout Button */}
          {user && (
            <button
              onClick={() => {
                if (onLogout) onLogout();
                navigate('/login');
              }}
              className="header-logout-btn"
              title="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
