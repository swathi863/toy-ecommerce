import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartApi, updateCartQuantityApi, removeCartItemApi, createPaymentOrderApi, verifyPaymentApi } from '../services/apiService';
import { Trash2, ArrowLeft, ShoppingBag, CheckCircle2, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage({ user, onCartUpdated, onShowToast }) {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState({ items: [], totalItemsCount: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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

  const handlePayNow = async () => {
    setPaymentError(null);

    if (!cartData.items || cartData.items.length === 0) {
      setPaymentError('Your shopping cart is empty.');
      return;
    }

    try {
      setPaying(true);

      // Load Razorpay checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your network connection.');
      }

      // Step 1: Create Razorpay order on backend
      const orderData = await createPaymentOrderApi();

      if (!orderData || !orderData.razorpayOrderId) {
        throw new Error(orderData.message || 'Failed to initialize payment order.');
      }

      // Step 2: Open Razorpay Test Mode Checkout Modal
      const options = {
        key: orderData.keyId || 'rzp_test_TdrNwXVXQOMj7j',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: '🧸 Toyland',
        description: 'Toyland Order Payment (Test Mode)',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#243B6B'
        },
        handler: async function (response) {
          try {
            setPaying(true);
            // Step 3: Verify payment signature on backend
            const verifyRes = await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setCheckoutSuccess(verifyRes);
            setCartData({ items: [], totalItemsCount: 0, grandTotal: 0 });
            if (onCartUpdated) onCartUpdated();
            if (onShowToast) {
              onShowToast('success', 'Payment Successful!', 'Your order has been placed successfully.');
            }
          } catch (err) {
            setPaymentError('Payment failed. Please try again.');
            if (onShowToast) {
              onShowToast('error', 'Payment Verification Failed', err.message || 'Payment failed. Please try again.');
            }
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            setPaymentError('Payment was cancelled. Please try again when ready.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        setPaying(false);
        setPaymentError('Payment failed. Please try again.');
        if (onShowToast) {
          onShowToast('error', 'Payment Failed', 'Payment failed. Please try again.');
        }
      });

      razorpayInstance.open();
    } catch (err) {
      setPaying(false);
      setPaymentError(err.message || 'Payment failed. Please try again.');
      if (onShowToast) {
        onShowToast('error', 'Payment Error', err.message || 'Payment failed. Please try again.');
      }
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
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
            <CheckCircle2 size={38} />
          </div>
          <h2 className="auth-heading" style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>
            Payment successful!
          </h2>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.8rem' }}>
            Your order has been placed successfully.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem', fontSize: '0.95rem' }}>
            Order ID: <strong>{checkoutSuccess.orderId}</strong>
          </p>

          <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartData.grandTotal || 0;
  const shippingFee = 50.0;
  const finalTotal = subtotal + shippingFee;

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(subtotal);

  const formattedShipping = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(shippingFee);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(finalTotal);

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

        {paymentError && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '0.9rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 500,
            border: '1px solid #FCA5A5'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700 }}>Payment failed.</div>
              <div>Please try again.</div>
            </div>
          </div>
        )}

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
                      disabled={item.quantity <= 1 || paying}
                    >
                      -
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                      disabled={paying}
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
                      disabled={paying}
                      style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: paying ? 'not-allowed' : 'pointer', marginTop: '0.3rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Price Breakdown Sidebar / Summary */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid var(--border-light)'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formattedSubtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formattedShipping}</span>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-light)', margin: '0.8rem 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{formattedTotal}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>Secured by Razorpay Test Gateway</span>
                </div>

                <button
                  onClick={handlePayNow}
                  className="btn-submit-primary"
                  style={{ width: 'auto', padding: '0.9rem 2.5rem', minWidth: '180px' }}
                  disabled={paying}
                >
                  <CreditCard size={20} />
                  <span>{paying ? 'Processing...' : 'Pay Now'}</span>
                </button>
              </div>
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
