import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useCustomerAnalytics } from '../../hooks/useCustomerAnalytics';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(amount);

const formatNumber = (n) =>
  new Intl.NumberFormat('en-NG').format(n);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDateInput = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = 'blue', icon }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 bg-${color}-100 rounded-lg shrink-0 ml-3`}>
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, total, color = 'blue', format = 'number' }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const display = format === 'currency' ? formatCurrency(value) : formatNumber(value);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{display}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">{pct}% of total</p>
    </div>
  );
};

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────

const DonutChart = ({ segments, size = 120, strokeWidth = 20 }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            strokeLinecap="butt"
          />
        );
        offset += pct;
        return el;
      })}
    </svg>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CustomerAnalytics = () => {
  const defaultDateFrom = formatDateInput(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const defaultDateTo = formatDateInput(new Date());

  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo]     = useState(defaultDateTo);
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
  });

  const { data: res, isLoading, error, refetch } = useCustomerAnalytics(appliedFilters);
  const d = res?.data;

  const handleApply = () => {
    setAppliedFilters({ dateFrom, dateTo });
  };

  const handleReset = () => {
    setDateFrom(defaultDateFrom);
    setDateTo(defaultDateTo);
    setAppliedFilters({ dateFrom: defaultDateFrom, dateTo: defaultDateTo });
  };

  const payoutSuccessRate = d
    ? d.payoutCount > 0 ? Math.round((d.payoutSuccessCount / d.payoutCount) * 100) : 0
    : 0;

  const scheduledSuccessRate = d
    ? d.scheduledPaymentCount > 0
      ? Math.round((d.scheduledSuccessfulCount / d.scheduledPaymentCount) * 100)
      : 0
    : 0;

  return (
    <Layout>
      <div className="p-6 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Analytics</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Platform-wide customer and transaction overview
            </p>
          </div>

          {/* Date range filter */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Period banner */}
        {d && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              Showing data from{' '}
              <span className="font-semibold">{formatDate(d.dateFrom)}</span>
              {' '}to{' '}
              <span className="font-semibold">{formatDate(d.dateTo)}</span>
            </span>
            <span className="text-xs text-blue-500">
              Last transaction: {formatDate(d.lastTransactionAt)}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load analytics</p>
                <p className="text-sm text-red-700">{error?.message || 'An error occurred'}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {d && !isLoading && (
          <>
            {/* ── Section 1: Customers ── */}
            <section>
              <SectionHeader
                title="Customer Overview"
                subtitle="Total registered customers and wallet activity"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Customers"
                  value={formatNumber(d.totalCustomers)}
                  color="blue"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
                />
                <StatCard
                  label="Individual Customers"
                  value={formatNumber(d.individualCustomers)}
                  sub={`${d.totalCustomers > 0 ? Math.round((d.individualCustomers / d.totalCustomers) * 100) : 0}% of total`}
                  color="indigo"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                />
                <StatCard
                  label="Business Customers"
                  value={formatNumber(d.businessCustomers)}
                  sub={`${d.totalCustomers > 0 ? Math.round((d.businessCustomers / d.totalCustomers) * 100) : 0}% of total`}
                  color="purple"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                />
                <StatCard
                  label="Active Wallets"
                  value={formatNumber(d.activeWalletCount)}
                  sub={`${formatCurrency(d.totalWalletBalance)} total balance`}
                  color="green"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                />
              </div>

              {/* Customer type donut */}
              <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative shrink-0">
                    <DonutChart
                      size={140}
                      strokeWidth={24}
                      segments={[
                        { value: d.individualCustomers, color: '#6366f1' },
                        { value: d.businessCustomers,   color: '#a855f7' },
                      ]}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{d.totalCustomers}</p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <ProgressBar
                      label="Individual Customers"
                      value={d.individualCustomers}
                      total={d.totalCustomers}
                      color="indigo"
                    />
                    <ProgressBar
                      label="Business Customers"
                      value={d.businessCustomers}
                      total={d.totalCustomers}
                      color="purple"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 2: Wallet & Balance ── */}
            <section>
              <SectionHeader
                title="Wallet & Balance"
                subtitle="Platform wallet balances and transaction flow"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label="Total Wallet Balance"
                  value={formatCurrency(d.totalWalletBalance)}
                  color="green"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <StatCard
                  label="Total Credit"
                  value={formatCurrency(d.totalCreditAmount)}
                  sub={`${formatNumber(d.transactionCount)} total transactions`}
                  color="green"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l-8 8h16l-8-8z" />}
                />
                <StatCard
                  label="Total Debit"
                  value={formatCurrency(d.totalDebitAmount)}
                  color="red"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l8-8H4l8 8z" />}
                />
              </div>

              {/* Credit vs Debit bar */}
              <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Credit vs Debit Breakdown</h3>
                <ProgressBar
                  label="Total Credits"
                  value={d.totalCreditAmount}
                  total={d.totalCreditAmount + d.totalDebitAmount}
                  color="green"
                  format="currency"
                />
                <ProgressBar
                  label="Total Debits"
                  value={d.totalDebitAmount}
                  total={d.totalCreditAmount + d.totalDebitAmount}
                  color="red"
                  format="currency"
                />
              </div>
            </section>

            {/* ── Section 3: Payouts ── */}
            <section>
              <SectionHeader
                title="Payout Activity"
                subtitle="Bank transfer performance and success rates"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Payouts"
                  value={formatNumber(d.payoutCount)}
                  color="blue"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
                />
                <StatCard
                  label="Payout Amount"
                  value={formatCurrency(d.payoutAmount)}
                  color="blue"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <StatCard
                  label="Successful Payouts"
                  value={formatNumber(d.payoutSuccessCount)}
                  sub={`${payoutSuccessRate}% success rate`}
                  color="green"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                />
                <StatCard
                  label="Failed Payouts"
                  value={formatNumber(d.payoutFailedCount)}
                  sub={`${100 - payoutSuccessRate}% failure rate`}
                  color="red"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                />
              </div>

              {/* Success rate visual */}
              <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Payout Success Rate</h3>
                  <span className="text-2xl font-bold text-green-600">{payoutSuccessRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
                    style={{ width: `${payoutSuccessRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>{d.payoutSuccessCount} successful</span>
                  <span>{d.payoutFailedCount} failed</span>
                </div>
              </div>
            </section>

            {/* ── Section 4: P2P ── */}
            <section>
              <SectionHeader
                title="P2P Transfer Activity"
                subtitle="Peer-to-peer transfer volume and amounts"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="P2P Sent (Count)"
                  value={formatNumber(d.p2PSentCount)}
                  color="orange"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                />
                <StatCard
                  label="P2P Sent Amount"
                  value={formatCurrency(d.p2PSentAmount)}
                  color="orange"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l8-8H4l8 8z" />}
                />
                <StatCard
                  label="P2P Received (Count)"
                  value={formatNumber(d.p2PReceivedCount)}
                  color="teal"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                />
                <StatCard
                  label="P2P Received Amount"
                  value={formatCurrency(d.p2PReceivedAmount)}
                  color="teal"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l-8 8h16l-8-8z" />}
                />
              </div>
            </section>

            {/* ── Section 5: Scheduled Payments ── */}
            <section>
              <SectionHeader
                title="Scheduled Payment Activity"
                subtitle="Breakdown of scheduled transfers by type and status"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label="Total Scheduled"
                  value={formatNumber(d.scheduledPaymentCount)}
                  color="blue"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                />
                <StatCard
                  label="Scheduled Payouts"
                  value={formatNumber(d.scheduledPayoutCount)}
                  color="blue"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
                />
                <StatCard
                  label="Scheduled P2P"
                  value={formatNumber(d.scheduledP2PCount)}
                  color="indigo"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                />
                <StatCard
                  label="Pending"
                  value={formatNumber(d.scheduledPendingCount)}
                  color="yellow"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <StatCard
                  label="Successful"
                  value={formatNumber(d.scheduledSuccessfulCount)}
                  sub={`${scheduledSuccessRate}% success rate`}
                  color="green"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                />
                <StatCard
                  label="Failed"
                  value={formatNumber(d.scheduledFailedCount)}
                  color="red"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                />
              </div>

              {/* Scheduled breakdown bar */}
              <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Scheduled Payment Breakdown</h3>
                <ProgressBar label="Payouts" value={d.scheduledPayoutCount} total={d.scheduledPaymentCount} color="blue" />
                <ProgressBar label="P2P Transfers" value={d.scheduledP2PCount} total={d.scheduledPaymentCount} color="indigo" />
                <ProgressBar label="Successful" value={d.scheduledSuccessfulCount} total={d.scheduledPaymentCount} color="green" />
                <ProgressBar label="Failed" value={d.scheduledFailedCount} total={d.scheduledPaymentCount} color="red" />
              </div>
            </section>

            {/* ── Section 6: Product Volumes ── */}
            <section>
              <SectionHeader
                title="Product Volumes"
                subtitle="Total volumes processed per product type"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Payout Product</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(d.productPayoutAmount)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total payout product volume</p>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">P2P Sent Product</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(d.productP2PSentAmount)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total P2P sent product volume</p>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">P2P Received Product</p>
                  <p className="text-2xl font-bold text-teal-600">{formatCurrency(d.productP2PReceivedAmount)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total P2P received product volume</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CustomerAnalytics;