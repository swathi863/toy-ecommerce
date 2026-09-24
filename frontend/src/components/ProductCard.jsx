import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(product.price);

  return (
    <div className="product-card">
      {/* Category Tag */}
      {product.categoryName && (
        <span className="category-badge">{product.categoryName}</span>
      )}

      {/* Product Image & Wishlist Button */}
      <div className="product-image-box" style={{ position: 'relative' }}>
        <img
          src={product.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
          alt={product.name}
          loading="lazy"
        />

        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleWishlist(product);
            }}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              zIndex: 2
            }}
          >
            <Heart
              size={18}
              color={isInWishlist ? "#EC4899" : "#64748B"}
              fill={isInWishlist ? "#EC4899" : "none"}
            />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <Link to={`/products/${product.productId}`} className="product-name">
          {product.name}
        </Link>
        <p className="product-desc">{product.description}</p>

        <div className="product-rating-stock">
          <span className="rating-stars">
            <Star size={14} fill="#F59E0B" color="#F59E0B" /> 4.5
          </span>
          <span className={`stock-tag ${product.stock < 15 ? 'low' : ''}`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </span>
        </div>

        <div className="price-text">{formattedPrice}</div>
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <Link
          to={`/products/${product.productId}`}
          className="btn-view-details"
        >
          View Details
        </Link>
        <button
          onClick={() => onAddToCart(product)}
          className="btn-add-cart"
          disabled={product.stock <= 0}
        >
          <ShoppingBag size={15} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
