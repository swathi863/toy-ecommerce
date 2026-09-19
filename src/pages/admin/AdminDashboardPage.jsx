import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminBusinessSummaryApi } from '../../services/apiService';
import { Users, Package, ShoppingCart, DollarSign, Calendar, TrendingUp, Award, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage({ onShowToast }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await getAdminBusinessSummaryApi();
      setSummary(data);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Dashboard Error', err.message || 'Failed to load business summary metrics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Admin Dashboard Metrics...
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
          Real-time summary of store users, products, orders, and sales revenues
        </p>
      </div>

      {/* Metric Cards Grid - Top Tier: Counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Total Users */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            {summary?.totalUsers || 0}
          </div>
          <Link to="/admin/users" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            <span>Manage Users</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Total Products */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            {summary?.totalProducts || 0}
          </div>
          <Link to="/admin/products" style={{ fontSize: '0.82rem', color: '#D97706', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            <span>Manage Products</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={22} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            {summary?.totalOrders || 0}
          </div>
          <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: '#059669', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            <span>View All Orders</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Bottom Tier: Revenue Breakdown */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
        Business Revenue Overview
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Today's Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <DollarSign size={18} color="#2563EB" />
            <span>Today's Business</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>
            {formatCurrency(summary?.dailyBusiness)}
          </div>
        </div>

        {/* Monthly Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <Calendar size={18} color="#D97706" />
            <span>This Month</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>
            {formatCurrency(summary?.monthlyBusiness)}
          </div>
        </div>

        {/* Yearly Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <TrendingUp size={18} color="#059669" />
            <span>This Year</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
            {formatCurrency(summary?.yearlyBusiness)}
          </div>
        </div>

        {/* Overall Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #243B6B', boxShadow: '0 4px 14px rgba(36, 59, 107, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-navy)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            <Award size={18} color="#243B6B" />
            <span>Overall Business</span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#243B6B' }}>
            {formatCurrency(summary?.overallBusiness)}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Link to="/admin/products" style={{ textDecoration: 'none', backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s ease' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>Manage Product Catalog</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Add, edit, update stock, price, & delete products</div>
          </div>
          <ArrowUpRight size={24} color="var(--secondary-orange)" />
        </Link>

        <Link to="/admin/orders" style={{ textDecoration: 'none', backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s ease' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>Customer Orders</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>View customer orders & update order statuses</div>
          </div>
          <ArrowUpRight size={24} color="var(--secondary-orange)" />
        </Link>
      </div>
    </div>
  );
}
