import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartApi, updateCartQuantityApi, removeCartItemApi } from '../services/apiService';
import { Trash2, ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage({ user, onCartUpdated, onShowToast }) {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState({ items: [], totalItemsCount: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getCartApi();
      setCartData(data);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        navigate('/login');
      } else if (onShowToast) {
        onShowToast('error', 'Cart Error', 'Failed to load cart items.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleUpdateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartQuantityApi(cartItemId, newQty);
      await fetchCart();
      if (onCartUpdated) onCartUpdated();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Update Error', err.message);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItemApi(cartItemId);
      if (onShowToast) onShowToast('info', 'Item Removed', 'Product removed from cart.');
      await fetchCart();
      if (onCartUpdated) onCartUpdated();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Remove Error', err.message);
    }
  };

  const handleBuyNow = () => {
    if (!cartData.items || cartData.items.length === 0) {
      if (onShowToast) onShowToast('warning', 'Cart Empty', 'Your cart is empty. Add items before proceeding to checkout.');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="cart-page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Please Log In to Access Your Cart</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
          Authentication is required to view and manage your shopping bag.
        </p>
        <Link to="/login" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto' }}>
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your shopping cart...</p>
      </div>
    );
  }

  const cartTotalFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(cartData.grandTotal || 0);

  return (
    <div className="cart-page-container">
      <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} />
        <span>Continue Shopping</span>
      </Link>

      <div className="cart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 className="auth-heading" style={{ fontSize: '1.6rem', textAlign: 'left', margin: 0, color: 'var(--primary-navy)' }}>
            My Cart
          </h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {cartData.totalItemsCount} {cartData.totalItemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cartData.items && cartData.items.length > 0 ? (
          <div>
            {cartData.items.map((item) => {
              const itemTotalFormatted = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
              }).format(item.totalItemPrice);

              return (
                <div key={item.cartId} className="cart-item-row">
                  <div className="cart-item-thumb">
                    <img src={item.imageUrl} alt={item.productName} />
                  </div>

                  <div className="cart-item-info">
                    <Link to={`/products/${item.productId}`} className="cart-item-title" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                      {item.productName}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      ₹{item.price} each
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Total Price & Remove Button */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.1rem' }}>
                      {itemTotalFormatted}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.cartId)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginTop: '0.3rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Cart Total & BUY NOW Button Bar */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' }}>Cart Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{cartTotalFormatted}</span>
              </div>

              <button
                onClick={handleBuyNow}
                className="btn-submit-primary"
                style={{ width: 'auto', padding: '0.9rem 2.5rem', minWidth: '180px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>BUY NOW</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <ShoppingBag size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
            <h3>Your Shopping Cart is Empty</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              Explore our toy catalog to add your favorite toys!
            </p>
            <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto' }}>
              Browse Toys
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
