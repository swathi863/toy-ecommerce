import React, { useState, useEffect } from 'react';
import { getAdminBusinessSummaryApi } from '../../services/apiService';
import { DollarSign, Calendar, TrendingUp, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminBusinessPage({ onShowToast }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const data = await getAdminBusinessSummaryApi();
      setSummary(data);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Business Data Error', err.message || 'Failed to load business sales analytics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating business sales analytics...</div>;
  }

  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const currentYear = currentDate.getFullYear();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
          Business & Sales Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
          Real-time calculated business revenue metrics from completed and verified customer payments
        </p>
      </div>

      {/* Main Revenue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Daily Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Business
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2563EB', marginBottom: '0.4rem' }}>
            {formatCurrency(summary?.dailyBusiness)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Calculated for today ({currentDate.toLocaleDateString('en-IN')})
          </div>
        </div>

        {/* Monthly Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Business
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#D97706', marginBottom: '0.4rem' }}>
            {formatCurrency(summary?.monthlyBusiness)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Revenue for {currentMonthYear}
          </div>
        </div>

        {/* Yearly Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Yearly Business
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#059669', marginBottom: '0.4rem' }}>
            {formatCurrency(summary?.yearlyBusiness)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total revenue for year {currentYear}
          </div>
        </div>

        {/* Overall Business */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 1.5rem', borderRadius: '16px', border: '2px solid #243B6B', boxShadow: '0 6px 18px rgba(36, 59, 107, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Business
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#243B6B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            {formatCurrency(summary?.overallBusiness)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Cumulative revenue across all completed orders
          </div>
        </div>
      </div>

      {/* Audit Note Card */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#EFF6FF', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            Automated Audit & Verification
          </h3>
          <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            All business figures are dynamically aggregated directly from successful, verified orders in the database.
            Failed, unverified, or cancelled payments are strictly excluded from calculation results.
          </p>
        </div>
      </div>
    </div>
  );
}
