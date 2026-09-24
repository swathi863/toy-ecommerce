import React, { useState, useEffect } from 'react';
import { 
  getAdminDailyBusinessApi, 
  getAdminMonthlyBusinessApi, 
  getAdminYearlyBusinessApi, 
  getAdminOverallBusinessApi,
  getAdminBusinessSummaryApi
} from '../../services/apiService';
import { DollarSign, Calendar, TrendingUp, Award, ShoppingCart, ShieldCheck, Filter, RefreshCw } from 'lucide-react';

const MONTHS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AdminBusinessPage({ onShowToast }) {
  const todayDateStr = getTodayDateString();
  const currentDate = new Date();
  const currentYearNum = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;

  // Filter state
  const [periodFilter, setPeriodFilter] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(currentYearNum);

  // Data state
  const [filteredResult, setFilteredResult] = useState({ totalSales: 0, ordersCount: 0 });
  const [overallSummary, setOverallSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingFilter, setFetchingFilter] = useState(false);

  // Years options array (5 years back to 5 years forward)
  const yearsList = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);

  // Initial load summary
  const fetchOverallSummary = async () => {
    try {
      const summary = await getAdminBusinessSummaryApi();
      setOverallSummary(summary);
    } catch (err) {
      console.error('Failed to load overall summary:', err);
    }
  };

  // Fetch data based on selected filter
  const fetchFilteredBusinessData = async () => {
    try {
      setFetchingFilter(true);
      setError(null);
      let res;
      if (periodFilter === 'daily') {
        res = await getAdminDailyBusinessApi(selectedDate);
      } else if (periodFilter === 'monthly') {
        res = await getAdminMonthlyBusinessApi(selectedYear, selectedMonth);
      } else if (periodFilter === 'yearly') {
        res = await getAdminYearlyBusinessApi(selectedYear);
      } else if (periodFilter === 'overall') {
        res = await getAdminOverallBusinessApi();
      }

      setFilteredResult({
        totalSales: res.totalSales || res.dailyBusiness || res.monthlyBusiness || res.yearlyBusiness || res.overallBusiness || 0,
        ordersCount: res.ordersCount || 0,
        monthName: res.monthName,
        year: res.year,
        date: res.date
      });
    } catch (err) {
      const msg = err.message || 'Unable to connect to the server. Please try again.';
      setError(msg);
      if (onShowToast) {
        onShowToast('error', 'Sales Filter Error', msg);
      }
    } finally {
      setFetchingFilter(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverallSummary();
  }, []);

  useEffect(() => {
    fetchFilteredBusinessData();
  }, [periodFilter, selectedDate, selectedMonth, selectedYear]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const calculateAOV = (sales, count) => {
    if (!count || count === 0) return 0;
    return sales / count;
  };

  const getFilterLabel = () => {
    if (periodFilter === 'daily') {
      if (!selectedDate) return 'Daily Sales';
      const [y, m, d] = selectedDate.split('-');
      const dateObj = new Date(y, m - 1, d);
      return `Daily Sales (${dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    }
    if (periodFilter === 'monthly') {
      const monthObj = MONTHS.find(m => m.value === Number(selectedMonth));
      return `Monthly Sales (${monthObj ? monthObj.name : ''} ${selectedYear})`;
    }
    if (periodFilter === 'yearly') {
      return `Yearly Sales (Year ${selectedYear})`;
    }
    return 'Overall Cumulative Sales (All Time)';
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', maxWidth: '500px', margin: '3rem auto' }}>
        <RefreshCw size={36} color="var(--primary-navy)" className="spin" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--primary-navy)', margin: '0 0 0.5rem', fontWeight: 800 }}>Connecting to Server...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Calculating business sales analytics. Server may take up to 20-30 seconds to wake up.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #FCA5A5', maxWidth: '520px', margin: '3rem auto', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.08)' }}>
        <div style={{ width: '56px', height: '56px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <AlertCircle size={32} />
        </div>
        <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem', fontWeight: 800 }}>Unable to Connect to Server</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {error}
        </p>
        <button
          onClick={fetchFilteredBusinessData}
          className="btn-submit-primary"
          style={{ display: 'inline-flex', width: 'auto', gap: '0.5rem', padding: '0.75rem 1.8rem', margin: '0 auto' }}
        >
          <RotateCcw size={18} />
          <span>Retry Loading Sales</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
          Business & Sales Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
          Real-time dynamic sales metrics calculated directly from successful customer payments
        </p>
      </div>

      {/* Filter Control Box */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        border: '1px solid #E2E8F0', 
        boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Filter size={20} color="var(--primary-navy)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
            Sales Period Filter
          </h2>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
            { id: 'overall', label: 'Overall' }
          ].map((tab) => {
            const isActive = periodFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPeriodFilter(tab.id)}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  border: isActive ? '2px solid #243B6B' : '1px solid #CBD5E1',
                  backgroundColor: isActive ? '#243B6B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--primary-navy)',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(36, 59, 107, 0.2)' : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Controls per Filter */}
        <div style={{ 
          backgroundColor: '#F8FAFC', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {periodFilter === 'daily' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--primary-navy)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setSelectedDate(todayDateStr)}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Today
              </button>
            </div>
          )}

          {periodFilter === 'monthly' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                  Month:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{
                    padding: '0.5rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--primary-navy)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                  Year:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: '0.5rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--primary-navy)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {periodFilter === 'yearly' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                Select Year:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--primary-navy)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {periodFilter === 'overall' && (
            <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Viewing total cumulative sales revenue and orders count across all time.
            </div>
          )}

          {fetchingFilter && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontSize: '0.85rem', fontWeight: 600, marginLeft: 'auto' }}>
              <RefreshCw size={16} className="spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Dynamic Results Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Total Sales Revenue */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '1.8rem 1.5rem', 
          borderRadius: '16px', 
          border: '2px solid #243B6B', 
          boxShadow: '0 6px 18px rgba(36, 59, 107, 0.08)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Sales Revenue
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#243B6B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            {formatCurrency(filteredResult.totalSales)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {getFilterLabel()}
          </div>
        </div>

        {/* Total Successful Orders */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '1.8rem 1.5rem', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Successful Orders
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', marginBottom: '0.4rem' }}>
            {filteredResult.ordersCount} <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Orders</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total completed paid orders in period
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '1.8rem 1.5rem', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 4px 14px rgba(36, 59, 107, 0.04)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Average Order Value
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#D97706', marginBottom: '0.4rem' }}>
            {formatCurrency(calculateAOV(filteredResult.totalSales, filteredResult.ordersCount))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Average revenue generated per order
          </div>
        </div>
      </div>

      {/* Overall Reference Overview */}
      {overallSummary && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
            Quick Reference Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Today</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563EB', marginTop: '0.3rem' }}>
                {formatCurrency(overallSummary.dailyBusiness)}
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>This Month</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706', marginTop: '0.3rem' }}>
                {formatCurrency(overallSummary.monthlyBusiness)}
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>This Year</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '0.3rem' }}>
                {formatCurrency(overallSummary.yearlyBusiness)}
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>All Time</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.3rem' }}>
                {formatCurrency(overallSummary.overallBusiness)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Note */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#EFF6FF', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.3rem', margin: 0 }}>
            Automated Audit & Verification
          </h3>
          <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0.3rem 0 0' }}>
            All sales figures and order counts are dynamically calculated directly from verified customer orders in the database.
            Failed, unverified, or cancelled payments are strictly excluded from all business calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
