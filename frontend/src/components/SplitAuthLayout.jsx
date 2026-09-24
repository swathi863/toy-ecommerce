import React from 'react';

export default function SplitAuthLayout({ children }) {
  return (
    <div className="auth-split-wrapper">
      {/* LEFT SIDE (50%): Image from requested URL */}
      <div className="auth-split-left-image-side">
        <img
          src="https://ik.imagekit.io/StringStackSwathi/Educational/Educational/main.png"
          alt="Toyland - Small Toys Big Smiles"
          className="auth-split-main-img"
        />
      </div>

      {/* RIGHT SIDE (50%): Existing Auth Form Content */}
      <div className="auth-split-right-form-side">
        <div className="auth-split-form-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

