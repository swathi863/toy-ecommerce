import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductByIdApi, addToCartApi, checkWishlistStatusApi, toggleWishlistApi } from '../services/apiService';
import { ShoppingBag, ArrowLeft, Star, Heart, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ProductDetailsPage({ user, onCartUpdated, onWishlistUpdated, onShowToast }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductByIdApi(productId);
        setProduct(data);
        if (data.imageUrl) {
          setSelectedImage(data.imageUrl);
        }

        if (user) {
          const wishStatus = await checkWishlistStatusApi(productId);
          setInWishlist(wishStatus);
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
  }, [productId, user]);

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

  const handleToggleWishlist = async () => {
    if (!user) {
      if (onShowToast) onShowToast('info', 'Login Required', 'Please login to manage your wishlist.');
      navigate('/login');
      return;
    }

    try {
      setTogglingWishlist(true);
      const res = await toggleWishlistApi(product.productId);
      setInWishlist(res.inWishlist);
      if (onShowToast) {
        onShowToast(
          res.inWishlist ? 'success' : 'info',
          res.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
          res.message || (res.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist')
        );
      }
      if (onWishlistUpdated) onWishlistUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Wishlist Error', err.message || 'Failed to update wishlist');
      }
    } finally {
      setTogglingWishlist(false);
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
                    border: selectedImage === img ? '2px solid var(--primary-navy)' : '1px solid var(--border-gray)'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Info */}
        <div className="details-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="category-badge" style={{ position: 'static', width: 'fit-content' }}>
              {product.categoryName}
            </span>
            <span style={{
              background: '#FEF3C7',
              color: '#D97706',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <RotateCcw size={13} />
              10-Day Easy Returns
            </span>
          </div>

          <h1 className="details-title">{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="rating-stars" style={{ fontSize: '1rem' }}>
              <Star size={18} fill="#F59E0B" color="#F59E0B" /> 4.8 / 5.0 Rating
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

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              className="btn-submit-primary"
              style={{ flex: 1, minWidth: 160 }}
              disabled={adding || product.stock <= 0}
            >
              <ShoppingBag size={20} />
              <span>{adding ? 'Adding to Cart...' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                border: inWishlist ? '2px solid #EC4899' : '1px solid var(--border-gray)',
                background: inWishlist ? '#FCE7F3' : '#FFFFFF',
                color: inWishlist ? '#DB2777' : 'var(--text-navy)',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart
                size={20}
                color={inWishlist ? "#DB2777" : "#64748B"}
                fill={inWishlist ? "#DB2777" : "none"}
              />
              <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Dedicated Return Policy Section */}
          <div style={{
            marginTop: '2rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)'
          }}>
            <h3 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--primary-navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={18} color="#D97706" />
              Return Policy
            </h3>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>✓</span> Eligible for return within 10 days of delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>✓</span> Return request must be submitted within the return period
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>✓</span> Refund will be processed after the return request
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>✓</span> Refund completion may take 1–2 days
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                <span style={{ color: '#059669' }}>✓</span> Return eligibility is calculated from the delivery date
              </div>
            </div>

            {/* Detailed Policy Text */}
            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.3rem' }}>
                10-Day Easy Returns
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>
                You can return this product within 10 days from the date it is delivered.
              </p>
              <ul style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, paddingLeft: '1.2rem', margin: 0 }}>
                <li>Return requests must be submitted within 10 days of delivery.</li>
                <li>The return period starts from the actual delivery date.</li>
                <li>Once a return is requested, the refund will be processed within 1–2 days.</li>
                <li>Return availability is shown on your Orders page.</li>
                <li>Returns are not available after the 10-day return period.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
