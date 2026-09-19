import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrdersApi } from '../services/apiService';
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, ShoppingBag, Truck } from 'lucide-react';

export default function OrdersPage({ user, onShowToast }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          color: 'var(--primary)',
          padding: '0.3rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Truck size={14} />
          Status: {status === 'SUCCESS' ? 'Confirmed' : (status || 'Confirmed')}
        </span>
      </div>
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
          <h1 className="auth-heading" style={{ fontSize: '1.8rem', textAlign: 'left', margin: 0, color: 'var(--primary)' }}>
            👤 {displayName}'s Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.92rem' }}>
            Account: <strong>{user?.email || displayName}</strong>
          </p>
        </div>

        <span style={{
          backgroundColor: '#F1F5F9',
          color: 'var(--primary)',
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
          <Package size={56} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No Orders Found for {displayName}</h3>
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
              <div key={order.orderId} className="cart-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                {/* Order Top Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => {
                      const itemTotalFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.totalPrice || (item.pricePerUnit * item.quantity));
                      const unitPriceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.pricePerUnit || 0);

                      return (
                        <div key={item.orderItemsId || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={item.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
                            alt={item.productName}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.98rem' }}>
                              {item.productName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Quantity: <strong>{item.quantity}</strong> × {unitPriceFormatted}
                            </div>
                          </div>

                          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem', textAlign: 'right' }}>
                            {itemTotalFormatted}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                    <span>Total Amount</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
