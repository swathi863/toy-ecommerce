import React, { useState } from 'react';
import toylandAuthBanner from '../assets/toyland-auth-banner.png';

export default function SplitAuthLayout({ children }) {
  const [imgSrc, setImgSrc] = useState(toylandAuthBanner);

  const handleError = () => {
    if (imgSrc !== '/toyland-auth-banner.png') {
      setImgSrc('/toyland-auth-banner.png');
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* LEFT SIDE (50%): Uploaded Toyland Image */}
      <div className="auth-split-left-image-side">
        <img
          src={imgSrc}
          alt="Toyland - Small Toys Big Smiles"
          className="auth-split-main-img"
          onError={handleError}
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
