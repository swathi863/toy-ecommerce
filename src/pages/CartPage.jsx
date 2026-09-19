import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartApi, updateCartQuantityApi, removeCartItemApi, checkoutApi } from '../services/apiService';
import { Trash2, ArrowLeft, ShoppingBag, CheckCircle2, CreditCard } from 'lucide-react';

export default function CartPage({ user, onCartUpdated, onShowToast }) {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState({ items: [], totalItemsCount: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

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

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      const res = await checkoutApi();
      setCheckoutSuccess(res);
      setCartData({ items: [], totalItemsCount: 0, grandTotal: 0 });
      if (onCartUpdated) onCartUpdated();
      if (onShowToast) {
        onShowToast('success', 'Order Placed!', `Order #${res.orderId} placed successfully!`);
      }
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Checkout Failed', err.message);
    } finally {
      setCheckingOut(false);
    }
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

  if (checkoutSuccess) {
    return (
      <div className="cart-page-container">
        <div className="cart-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={38} />
          </div>
          <h2 className="auth-heading">Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Thank you for shopping at Toyland! Your order ID is <strong>{checkoutSuccess.orderId}</strong>.
          </p>

          <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const formattedGrandTotal = new Intl.NumberFormat('en-IN', {
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
          <h1 className="auth-heading" style={{ fontSize: '1.6rem', textAlign: 'left', margin: 0 }}>
            Your Shopping Bag
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

                  {/* Total Price & Delete */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
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

            {/* Cart Summary & Checkout */}
            <div className="cart-summary-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Grand Total:</span>
                <span className="summary-grand-total">{formattedGrandTotal}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-submit-primary"
                style={{ width: 'auto', padding: '0.9rem 2.5rem' }}
                disabled={checkingOut}
              >
                <CreditCard size={20} />
                <span>{checkingOut ? 'Processing Order...' : 'Proceed to Checkout'}</span>
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
