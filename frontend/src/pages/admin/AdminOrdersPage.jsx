import React, { useState, useEffect } from 'react';
import { getAdminOrdersApi, updateAdminOrderStatusApi } from '../../services/apiService';
import { ShoppingCart, Clock, CheckCircle2, XCircle, Truck, Package, Filter } from 'lucide-react';

export default function AdminOrdersPage({ onShowToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrdersApi();
      setOrders(data || []);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Orders Error', err.message || 'Failed to load customer orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateAdminOrderStatusApi(orderId, newStatus);
      if (onShowToast) {
        onShowToast('success', 'Status Updated', `Order #${orderId} status changed to ${newStatus}`);
      }
      await fetchOrders();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Update Failed', err.message || 'Failed to update order status.');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer orders...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
            Order Management
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
            Inspect customer orders, verify payment details, and update shipment/delivery status
          </p>
        </div>

        <span style={{ backgroundColor: '#F1F5F9', color: 'var(--primary-navy)', padding: '0.5rem 1rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem' }}>
          {orders.length} Total Orders
        </span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '4rem 2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <ShoppingCart size={54} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No customer orders have been recorded in the database yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const isPaid = order.paymentStatus === 'Paid' || order.status === 'SUCCESS' || order.status === 'CONFIRMED';

            return (
              <div key={order.orderId} style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
                {/* Order Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Order #{order.orderId}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} />
                        {formatDate(order.createdAt)}
                      </span>
                      <span>•</span>
                      <span>Customer: <strong>{order.customerName}</strong> ({order.customerEmail})</span>
                    </div>
                  </div>

                  {/* Status Dropdown & Payment Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: isPaid ? '#DEF7EC' : '#FDE8E8',
                      color: isPaid ? '#03543F' : '#9B1C1C',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {isPaid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      Payment: {order.paymentStatus || 'Paid'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Status:</label>
                      <select
                        value={order.status || 'CONFIRMED'}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        disabled={updatingOrderId === order.orderId}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          border: '1.5px solid var(--primary-navy)',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--primary-navy)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUCCESS">CONFIRMED (SUCCESS)</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={item.orderItemsId || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={item.imageUrl || 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg'}
                          alt={item.productName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Quantity: <strong>{item.quantity}</strong> × {formatCurrency(item.pricePerUnit)}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.98rem' }}>
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Purchased items recorded.</div>
                  )}
                </div>

                {/* Total Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Includes fixed ₹50 Shipping Fee
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Total: {formatCurrency(order.totalAmount)}
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
