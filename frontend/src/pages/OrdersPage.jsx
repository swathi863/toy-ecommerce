import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrdersApi, requestReturnItemApi } from '../services/apiService';
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, Truck, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OrdersPage({ user, onShowToast }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [returnModal, setReturnModal] = useState({
    isOpen: false,
    orderId: null,
    item: null,
    submitting: false
  });

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getMyOrdersApi();
      setOrders(data || []);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        navigate('/login');
      } else if (onShowToast) {
        onShowToast('error', 'Orders Error', err.message || 'Failed to load order history.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getUserDisplayName = (usr) => {
    if (!usr) return 'User';
    if (usr.name && usr.name.trim()) return usr.name;
    if (usr.userName && usr.userName.trim()) return usr.userName;
    if (usr.email) {
      const namePart = usr.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'User';
  };

  const handleOpenReturnModal = (orderId, item) => {
    setReturnModal({
      isOpen: true,
      orderId,
      item,
      submitting: false
    });
  };

  const handleCloseReturnModal = () => {
    setReturnModal({
      isOpen: false,
      orderId: null,
      item: null,
      submitting: false
    });
  };

  const handleConfirmReturn = async () => {
    if (!returnModal.orderId || !returnModal.item) return;

    const { orderId, item } = returnModal;

    try {
      setReturnModal(prev => ({ ...prev, submitting: true }));
      const response = await requestReturnItemApi(orderId, item.orderItemsId);

      // Toast notification
      if (onShowToast) {
        onShowToast(
          'success',
          'Return Requested',
          response.message || 'Return requested successfully. Your refund will be processed within 1–2 days.'
        );
      }

      // Close modal & refresh orders list
      handleCloseReturnModal();
      await fetchOrders();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Return Failed', err.message || 'Failed to submit return request.');
      }
      setReturnModal(prev => ({ ...prev, submitting: false }));
    }
  };

  if (!user) {
    return (
      <div className="cart-page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Please Log In to View Your Orders</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
          Authentication is required to view your order history.
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
        <p style={{ color: 'var(--text-muted)' }}>Loading order history for {getUserDisplayName(user)}...</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent Order';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    const isPaid = paymentStatus === 'Paid' || status === 'SUCCESS' || status === 'CONFIRMED';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {isPaid ? (
          <span style={{
            backgroundColor: '#DEF7EC',
            color: '#03543F',
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle2 size={14} />
            Payment: Paid
          </span>
        ) : (
          <span style={{
            backgroundColor: '#FDE8E8',
            color: '#9B1C1C',
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <XCircle size={14} />
            Payment: {paymentStatus || 'Failed'}
          </span>
        )}

        <span style={{
          backgroundColor: '#E1E7F5',
          color: 'var(--primary-navy)',
          padding: '0.3rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Truck size={14} />
          Status: {status === 'SUCCESS' ? 'Delivered' : (status || 'Delivered')}
        </span>
      </div>
    );
  };

  const renderReturnStatusBadge = (order, item) => {
    const status = item.returnStatus || 'NONE';

    if (status === 'RETURN_REQUESTED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <span style={{
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <RotateCcw size={13} />
            Return Requested
          </span>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 500 }}>
            Refund in 1–2 days
          </span>
        </div>
      );
    }

    if (status === 'REFUND_COMPLETED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <span style={{
            backgroundColor: '#D1FAE5',
            color: '#059669',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <ShieldCheck size={13} />
            Refund Completed
          </span>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>
            Refund Processed Successfully
          </span>
        </div>
      );
    }

    // Check 10-day return period eligibility
    const isEligible = item.returnEligible;

    if (isEligible) {
      return (
        <button
          onClick={() => handleOpenReturnModal(order.orderId, item)}
          style={{
            backgroundColor: '#FFF',
            color: '#D97706',
            border: '1px solid #FCD34D',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}
          title="Return this item within 10 days"
        >
          <RotateCcw size={14} />
          Return
        </button>
      );
    }

    return (
      <span style={{
        fontSize: '0.78rem',
        color: '#94A3B8',
        fontStyle: 'italic',
        background: '#F8FAFC',
        padding: '0.3rem 0.6rem',
        borderRadius: '4px',
        border: '1px solid #E2E8F0'
      }}>
        Return period expired
      </span>
    );
  };

  const displayName = getUserDisplayName(user);

  return (
    <div className="cart-page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} />
        <span>Continue Shopping</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="auth-heading" style={{ fontSize: '1.8rem', textAlign: 'left', margin: 0, color: 'var(--primary-navy)' }}>
            👤 {displayName}'s Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.92rem' }}>
            Account: <strong>{user?.email || displayName}</strong>
          </p>
        </div>

        <span style={{
          backgroundColor: '#F1F5F9',
          color: 'var(--primary-navy)',
          padding: '0.5rem 1rem',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="cart-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={56} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No Orders Found for {displayName}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You haven't placed any orders yet. Start exploring our wonderful toy collection!
          </p>
          <Link to="/home" className="btn-submit-primary" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
            Browse Toys
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const subtotal = order.subtotal || (order.totalAmount ? order.totalAmount - 50 : 0);
            const shippingFee = order.shippingFee || 50;
            const grandTotal = order.totalAmount || (subtotal + shippingFee);

            const formattedSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal);
            const formattedShipping = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(shippingFee);
            const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal);

            return (
              <div key={order.orderId} className="cart-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-gray)', background: '#FFF' }}>
                {/* Order Top Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-gray)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Order #{order.orderId}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {getStatusBadge(order.status, order.paymentStatus)}
                </div>

                {/* Purchased Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => {
                      const itemTotalFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.totalPrice || (item.pricePerUnit * item.quantity));
                      const unitPriceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.pricePerUnit || 0);

                      return (
                        <div key={item.orderItemsId || idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          paddingBottom: idx < order.items.length - 1 ? '1rem' : '0',
                          borderBottom: idx < order.items.length - 1 ? '1px dashed #E2E8F0' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                            <img
                              src={item.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
                              alt={item.productName}
                              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.98rem' }}>
                                {item.productName}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                Quantity: <strong>{item.quantity}</strong> × {unitPriceFormatted}
                              </div>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                                {itemTotalFormatted}
                              </div>
                            </div>
                          </div>

                          {/* Return Button / Status Badge */}
                          <div>
                            {renderReturnStatusBadge(order, item)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Item details processed.</div>
                  )}
                </div>

                {/* Order Summary Footer */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '1rem 1.2rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  marginTop: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    <span>Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    <span>Shipping Fee</span>
                    <span>{formattedShipping}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #CBD5E1', margin: '0.6rem 0' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    <span>Total Amount</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returnModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#FEF3C7', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} color="#D97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '1.2rem', fontWeight: 700 }}>
                  Confirm Product Return
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Order #{returnModal.orderId}</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to return <strong>"{returnModal.item?.productName}"</strong>?
            </p>

            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400E' }}>
              ℹ️ Once confirmed, your refund will be processed within 1–2 days.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseReturnModal}
                disabled={returnModal.submitting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-gray)',
                  background: '#FFFFFF',
                  color: 'var(--text-body)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReturn}
                disabled={returnModal.submitting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {returnModal.submitting ? 'Submitting...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
