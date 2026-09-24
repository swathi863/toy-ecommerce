import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, PackageCheck, AlertCircle } from 'lucide-react';
import { getWishlistApi, removeFromWishlistApi, addToCartApi } from '../services/apiService';

export default function WishlistPage({ user, onCartUpdated, onWishlistUpdated, onShowToast }) {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState({});

  const fetchWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getWishlistApi();
      setWishlistItems(data || []);
      if (onWishlistUpdated) onWishlistUpdated();
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        navigate('/login');
      } else if (onShowToast) {
        onShowToast('error', 'Wishlist Error', err.message || 'Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId, productName) => {
    try {
      setActionInProgress(prev => ({ ...prev, [productId]: true }));
      await removeFromWishlistApi(productId);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      if (onShowToast) {
        onShowToast('info', 'Removed from Wishlist', `${productName || 'Product'} has been removed from your wishlist.`);
      }
      if (onWishlistUpdated) onWishlistUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Error', err.message || 'Failed to remove from wishlist');
      }
    } finally {
      setActionInProgress(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (item) => {
    try {
      setActionInProgress(prev => ({ ...prev, [`cart_${item.productId}`]: true }));
      await addToCartApi(item.productId, 1);
      if (onShowToast) {
        onShowToast('success', 'Added to Cart', `${item.productName} added to your cart.`);
      }
      if (onCartUpdated) onCartUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Cart Error', err.message || 'Failed to add item to cart');
      }
    } finally {
      setActionInProgress(prev => ({ ...prev, [`cart_${item.productId}`]: false }));
    }
  };

  if (!user) {
    return (
      <div className="catalog-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#FFF', padding: '2.5rem', borderRadius: 12, boxShadow: 'var(--shadow-card)' }}>
          <Heart size={48} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>Please Log In</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You need to be logged in to view and manage your Wishlist.
          </p>

          <Link to="/login" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-container" style={{ flex: 1, paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div className="catalog-header-banner" style={{ marginBottom: '2rem' }}>
        <div className="catalog-title-group">
          <div className="title-with-accent">
            <span className="accent-line"></span>
            <h1 className="catalog-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Heart fill="#ec4899" color="#ec4899" size={28} /> My Wishlist
            </h1>
          </div>
          <p className="catalog-subtitle">
            Save your favorite toys for later and easily move them to your cart!
          </p>
        </div>
        <div className="catalog-count">
          <span>{wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved</span>
        </div>
      </div>

      <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} />
        <span>Continue Shopping</span>
      </Link>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFF', borderRadius: 12, border: '1px solid var(--border-gray)', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#FCE7F3', width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Heart size={36} color="#EC4899" />
          </div>
          <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Explore our toy collection and click the heart icon on any product to save it here.
          </p>
          <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Explore Toys Collection
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wishlistItems.map((item) => {
            const formattedPrice = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 2
            }).format(item.price || 0);

            const isRemoving = actionInProgress[item.productId];
            const isAddingCart = actionInProgress[`cart_${item.productId}`];

            return (
              <div
                key={item.wishlistId || item.productId}
                className="product-card"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Product Image */}
                <div className="product-image-box" style={{ position: 'relative' }}>
                  <img
                    src={item.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
                    alt={item.productName}
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.productName)}
                    disabled={isRemoving}
                    title="Remove from Wishlist"
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
                      color: '#EF4444'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Link to={`/products/${item.productId}`} className="product-name">
                      {item.productName}
                    </Link>
                    {item.description && (
                      <p className="product-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="product-rating-stock" style={{ marginTop: '0.5rem' }}>
                      <span className={`stock-tag ${item.stock < 15 ? 'low' : ''}`}>
                        {item.inStock ? `In Stock (${item.stock})` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="price-text" style={{ marginTop: '0.4rem' }}>{formattedPrice}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions" style={{ marginTop: '1rem' }}>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.productName)}
                    className="btn-view-details"
                    disabled={isRemoving}
                    style={{ background: '#FFF', color: '#EF4444', borderColor: '#FCA5A5' }}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-add-cart"
                    disabled={isAddingCart || !item.inStock}
                  >
                    <ShoppingBag size={15} />
                    <span>{isAddingCart ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
