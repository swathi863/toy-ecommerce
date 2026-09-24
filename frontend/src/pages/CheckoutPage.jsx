import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCartApi,
  createPaymentOrderApi,
  verifyPaymentApi
} from '../services/apiService';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  MapPin,
  PackageCheck
} from 'lucide-react';

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

export default function CheckoutPage({ user, onCartUpdated, onShowToast }) {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState({ items: [], totalItemsCount: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Delivery Address State
  const [address, setAddress] = useState({
    fullName: user?.name || user?.userName || '',
    phoneNumber: user?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || user.userName || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || ''
      }));
    }
  }, [user]);

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
        onShowToast('error', 'Cart Error', 'Failed to load cart for checkout.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const validateAddress = () => {
    const errs = {};

    if (!address.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }

    if (!address.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone Number is required.';
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(address.phoneNumber.trim())) {
      errs.phoneNumber = 'Please enter a valid phone number.';
    }

    if (!address.addressLine1.trim()) {
      errs.addressLine1 = 'Address Line 1 is required.';
    }

    if (!address.city.trim()) {
      errs.city = 'City is required.';
    }

    if (!address.state.trim()) {
      errs.state = 'State is required.';
    }

    if (!address.pincode.trim()) {
      errs.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(address.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits.';
    }

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    setPaymentError(null);

    if (!cartData.items || cartData.items.length === 0) {
      setPaymentError('Your shopping cart is empty.');
      return;
    }

    if (!validateAddress()) {
      setPaymentError('Please fill in all required delivery address fields correctly.');
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

      if (!orderData) {
        throw new Error('Failed to initialize payment order.');
      }

      // Step 2: Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId || 'rzp_test_TdrNwXVXQOMj7j',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: '🧸 Toyland',
        description: 'Toyland Order Payment (Test Mode)',
        prefill: {
          name: address.fullName || user?.name || '',
          email: user?.email || '',
          contact: address.phoneNumber || ''
        },
        theme: {
          color: '#243B6B'
        },
        handler: async function (response) {
          try {
            setPaying(true);
            // Step 3: Verify payment signature on backend with saved address
            const verifyRes = await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId || 'order_test_mock',
              razorpayPaymentId: response.razorpay_payment_id || 'pay_test_mock',
              razorpaySignature: response.razorpay_signature || 'sig_test_mock',
              fullName: address.fullName.trim(),
              phoneNumber: address.phoneNumber.trim(),
              addressLine1: address.addressLine1.trim(),
              addressLine2: address.addressLine2.trim(),
              city: address.city.trim(),
              state: address.state.trim(),
              pincode: address.pincode.trim()
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

      if (orderData.razorpayOrderId) {
        options.order_id = orderData.razorpayOrderId;
      }

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function () {
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
        <h2>Please Log In to Proceed to Checkout</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
          Authentication is required to place your order.
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
        <p style={{ color: 'var(--text-muted)' }}>Loading checkout details...</p>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="cart-page-container" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="cart-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
            <CheckCircle2 size={38} />
          </div>
          <h2 className="auth-heading" style={{ color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.8rem' }}>
            Thank you for shopping with Toyland.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem', fontSize: '0.95rem' }}>
            Order ID: <strong>{checkoutSuccess.orderId}</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
              <PackageCheck size={18} />
              <span>View My Orders</span>
            </Link>
            <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none', background: '#475569' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartData.grandTotal || 0;
  const shippingFee = 50.0;
  const finalTotal = subtotal + shippingFee;

  const formattedSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal);
  const formattedShipping = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(shippingFee);
  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(finalTotal);

  return (
    <div className="cart-page-container" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back to Cart link */}
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} />
        <span>Back to My Cart</span>
      </Link>

      <h1 className="auth-heading" style={{ fontSize: '1.8rem', textAlign: 'left', marginBottom: '1.5rem', color: 'var(--primary-navy)' }}>
        Checkout & Order Placement
      </h1>

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
            <div style={{ fontWeight: 700 }}>Checkout error</div>
            <div>{paymentError}</div>
          </div>
        </div>
      )}

      {cartData.items && cartData.items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* 1. DELIVERY ADDRESS */}
          <div className="cart-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-navy)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
              <MapPin size={20} color="var(--secondary-orange)" />
              <span>1. Delivery Address</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Full Name */}
              <div className={`field-group ${addressErrors.fullName ? 'is-invalid' : ''}`}>
                <label className="field-label" htmlFor="chk-fullname">Full Name *</label>
                <input
                  id="chk-fullname"
                  type="text"
                  className="field-input"
                  placeholder="Enter full name"
                  value={address.fullName}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, fullName: e.target.value }));
                    if (addressErrors.fullName) setAddressErrors(prev => ({ ...prev, fullName: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.fullName && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.fullName}</span></div>}
              </div>

              {/* Phone Number */}
              <div className={`field-group ${addressErrors.phoneNumber ? 'is-invalid' : ''}`}>
                <label className="field-label" htmlFor="chk-phone">Phone Number *</label>
                <input
                  id="chk-phone"
                  type="tel"
                  className="field-input"
                  placeholder="Enter phone number"
                  value={address.phoneNumber}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, phoneNumber: e.target.value }));
                    if (addressErrors.phoneNumber) setAddressErrors(prev => ({ ...prev, phoneNumber: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.phoneNumber && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.phoneNumber}</span></div>}
              </div>

              {/* Address Line 1 */}
              <div className={`field-group ${addressErrors.addressLine1 ? 'is-invalid' : ''}`} style={{ gridColumn: '1 / -1' }}>
                <label className="field-label" htmlFor="chk-line1">Address Line 1 (House No., Street) *</label>
                <input
                  id="chk-line1"
                  type="text"
                  className="field-input"
                  placeholder="House No., Street, Area"
                  value={address.addressLine1}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, addressLine1: e.target.value }));
                    if (addressErrors.addressLine1) setAddressErrors(prev => ({ ...prev, addressLine1: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.addressLine1 && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.addressLine1}</span></div>}
              </div>

              {/* Address Line 2 */}
              <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label" htmlFor="chk-line2">Address Line 2 (Apartment, Landmark) <span style={{ fontWeight: 400, color: '#64748B' }}>(Optional)</span></label>
                <input
                  id="chk-line2"
                  type="text"
                  className="field-input"
                  placeholder="Apartment, Landmark"
                  value={address.addressLine2}
                  onChange={(e) => setAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                  disabled={paying}
                />
              </div>

              {/* City */}
              <div className={`field-group ${addressErrors.city ? 'is-invalid' : ''}`}>
                <label className="field-label" htmlFor="chk-city">City *</label>
                <input
                  id="chk-city"
                  type="text"
                  className="field-input"
                  placeholder="Enter city"
                  value={address.city}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, city: e.target.value }));
                    if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.city && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.city}</span></div>}
              </div>

              {/* State */}
              <div className={`field-group ${addressErrors.state ? 'is-invalid' : ''}`}>
                <label className="field-label" htmlFor="chk-state">State *</label>
                <input
                  id="chk-state"
                  type="text"
                  className="field-input"
                  placeholder="Enter state"
                  value={address.state}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, state: e.target.value }));
                    if (addressErrors.state) setAddressErrors(prev => ({ ...prev, state: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.state && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.state}</span></div>}
              </div>

              {/* Pincode */}
              <div className={`field-group ${addressErrors.pincode ? 'is-invalid' : ''}`}>
                <label className="field-label" htmlFor="chk-pincode">Pincode *</label>
                <input
                  id="chk-pincode"
                  type="text"
                  maxLength={6}
                  className="field-input"
                  placeholder="6-digit pincode"
                  value={address.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAddress(prev => ({ ...prev, pincode: val }));
                    if (addressErrors.pincode) setAddressErrors(prev => ({ ...prev, pincode: '' }));
                  }}
                  disabled={paying}
                />
                {addressErrors.pincode && <div className="field-error-text"><AlertCircle size={14} /><span>{addressErrors.pincode}</span></div>}
              </div>
            </div>
          </div>

          {/* 2. ORDER SUMMARY */}
          <div className="cart-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-navy)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem' }}>
              <ShoppingBag size={20} color="var(--primary-navy)" />
              <span>2. Order Summary</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {cartData.items.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>{formattedSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                <span>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>{formattedShipping}</span>
              </div>
              <div style={{ borderTop: '1px dashed #E2E8F0', margin: '0.6rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                <span>Total Amount</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT & PLACE ORDER */}
          <div className="cart-card" style={{ padding: '1.5rem', borderRadius: '12px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-navy)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              <CreditCard size={20} color="var(--primary-navy)" />
              <span>3. Payment & Confirmation</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Pay securely using Razorpay Test Mode Gateway.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={18} color="var(--primary-navy)" />
                <span>Secured by Razorpay Test Gateway</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="btn-submit-primary"
                style={{ width: 'auto', padding: '0.9rem 2.5rem', minWidth: '200px' }}
                disabled={paying}
              >
                <CreditCard size={20} />
                <span>{paying ? 'Processing Order...' : 'Pay with Razorpay'}</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="cart-card" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <ShoppingBag size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>Your Shopping Cart is Empty</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Add products to your cart before proceeding to checkout.
          </p>
          <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Browse Toys
          </Link>
        </div>
      )}
    </div>
  );
}
