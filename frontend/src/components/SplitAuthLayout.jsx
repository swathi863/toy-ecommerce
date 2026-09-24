import React from 'react';

export default function SplitAuthLayout({ children, title, subtitle, imageSrc, badgeEmoji = "🧸" }) {
  const defaultImage = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";

  return (
    <div className="auth-split-wrapper">
      {/* LEFT SECTION: Toy Image & Visual Illustration (50%) */}
      <div className="auth-split-left-image-side">
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
                {subtitle || "Small Toys • Big Smiles. Premium toys & soft plushies for every child!"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Existing Auth Form Content (50%) */}
      <div className="auth-split-right-form-side">
        <div className="auth-split-form-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
