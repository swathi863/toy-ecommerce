import React from 'react';

export default function SplitAuthLayout({ children, title, subtitle, imageSrc, badgeEmoji = "🧸" }) {
  const defaultImage = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";

  return (
    <div className="auth-split-wrapper">
      {/* Left Section: Auth Form */}
      <div className="auth-split-left">
        <div className="auth-split-left-inner">
          {children}
        </div>
      </div>

      {/* Right Section: Toy Visual Illustration */}
      <div className="auth-split-right">
        <div className="auth-split-image-container">
          <img
            src={imageSrc || defaultImage}
            alt="Toyland Visual"
            className="auth-split-main-img"
          />
          <div className="auth-split-overlay-card">
            <div className="auth-split-overlay-badge">{badgeEmoji}</div>
            <div>
              <div className="auth-split-overlay-title">{title || "Discover Toyland"}</div>
              <div className="auth-split-overlay-desc">
                {subtitle || "Premium toys, soft teddy bears & action figures for every child's imagination."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
