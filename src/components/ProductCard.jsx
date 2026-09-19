import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Eye } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
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

      {/* Product Image */}
      <div className="product-image-box">
        <img
          src={product.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
          alt={product.name}
          loading="lazy"
        />
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
