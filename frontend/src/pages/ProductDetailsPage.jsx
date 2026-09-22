import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductByIdApi, addToCartApi } from '../services/apiService';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, Check } from 'lucide-react';

export default function ProductDetailsPage({ user, onCartUpdated, onShowToast }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductByIdApi(productId);
        setProduct(data);
        if (data.imageUrl) {
          setSelectedImage(data.imageUrl);
        }
      } catch (err) {
        if (onShowToast) {
          onShowToast('error', 'Error', 'Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      if (onShowToast) onShowToast('info', 'Login Required', 'Please login to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCartApi(product.productId, quantity);
      if (onShowToast) {
        onShowToast('success', 'Added to Cart!', `${quantity}x ${product.name} added to your cart.`);
      }
      if (onCartUpdated) onCartUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Cart Error', err.message || 'Failed to add item');
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="details-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="details-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Product Not Found</h2>
        <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(product.price);

  return (
    <div className="details-container">
      <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} />
        <span>Back to Toy Collection</span>
      </Link>

      <div className="details-card">
        {/* Product Image Showcase */}
        <div>
          <div className="details-image-container">
            <img src={selectedImage || product.imageUrl} alt={product.name} />
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto' }}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid var(--primary)' : '1px solid var(--border)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Info */}
        <div className="details-content">
          <span className="category-badge" style={{ position: 'static', width: 'fit-content' }}>
            {product.categoryName}
          </span>

          <h1 className="details-title">{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="rating-stars" style={{ fontSize: '1rem' }}>
              <Star size={18} fill="var(--accent-amber)" /> 4.8 / 5.0 Rating
            </span>
            <span className="stock-tag">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div className="details-price">{formattedPrice}</div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="details-quantity-row">
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</span>
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="btn-submit-primary"
            style={{ marginTop: '1.5rem' }}
            disabled={adding || product.stock <= 0}
          >
            <ShoppingBag size={20} />
            <span>{adding ? 'Adding to Cart...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
