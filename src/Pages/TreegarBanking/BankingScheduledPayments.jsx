import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  useAdminScheduledPayments,
  useAdminScheduledPayment,
  useAdminScheduledPaymentAttempts,
  useRetryScheduledPayment,
} from '../../hooks/useAdminScheduledPayments';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDateShort = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const STATUS_MAP = {
  Pending:    { badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', dot: 'bg-yellow-400' },
  Successful: { badge: 'bg-green-100 text-green-800 border border-green-200',   dot: 'bg-green-500'  },
  Failed:     { badge: 'bg-red-100 text-red-800 border border-red-200',         dot: 'bg-red-500'    },
  Cancelled:  { badge: 'bg-gray-100 text-gray-600 border border-gray-200',      dot: 'bg-gray-400'   },
  Rejected:   { badge: 'bg-red-100 text-red-700 border border-red-200',         dot: 'bg-red-400'    },
  Processing: { badge: 'bg-blue-100 text-blue-800 border border-blue-200',      dot: 'bg-blue-500'   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || STATUS_MAP.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ id, onClose }) => {
  const { data: paymentRes, isLoading } = useAdminScheduledPayment(id);
  const { data: attemptsRes, isLoading: attLoading } = useAdminScheduledPaymentAttempts(id);
  const retryMutation = useRetryScheduledPayment();
  const [retryMsg, setRetryMsg] = useState(null);

  const payment  = paymentRes?.data;
  const attempts = attemptsRes?.data || [];

  const handleRetry = async () => {
    setRetryMsg(null);
    try {
      const res = await retryMutation.mutateAsync(id);
      setRetryMsg({ ok: res.success, text: res.message });
    } catch (e) {
      setRetryMsg({ ok: false, text: e?.response?.data?.message || 'Retry failed' });
    }
  };

  const canRetry = payment && (payment.status === 'Failed' || payment.status === 'Pending');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-10">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Scheduled Payment #{id}
              </h2>
              {payment && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {payment.type} · {payment.scheduleType}
                  {payment.frequency && ` · ${payment.frequency}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {canRetry && (
                <button
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${retryMutation.isPending ? 'animate-spin' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {retryMutation.isPending ? 'Retrying...' : 'Retry Payment'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Retry feedback */}
          {retryMsg && (
            <div className={`mx-6 mt-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
              retryMsg.ok
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {retryMsg.text}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Loading payment details...</p>
            </div>
          ) : payment ? (
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

              {/* Amount + Status hero */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                  {payment.feeAmount && (
                    <p className="text-xs text-gray-400 mt-0.5">Fee: {formatCurrency(payment.feeAmount)}</p>
                  )}
                </div>
                <StatusBadge status={payment.status} />
              </div>

              {/* Two-column info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Payment Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Payment Info
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Customer ID',    value: (
                        <Link
                          to={`/banking/customers/${payment.customerId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={onClose}
                        >
                          #{payment.customerId}
                        </Link>
                      )},
                      { label: 'Recipient',      value: payment.accountName },
                      { label: 'Account Number', value: payment.accountNumber },
                      { label: 'Bank',           value: payment.bankId
                        ? `Bank ID: ${payment.bankId}`
                        : payment.type === 'P2P' ? 'Internal (P2P)' : '—'
                      },
                      { label: 'Narration',      value: payment.narration },
                      { label: 'Transfer Type',  value: payment.type },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4">
                        <span className="text-xs text-gray-400 shrink-0 pt-0.5">{label}</span>
                        <span className="text-sm text-gray-800 text-right font-medium break-all">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Schedule Info
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Schedule Type',  value: payment.scheduleType },
                      { label: 'Frequency',      value: payment.frequency || 'One-time' },
                      { label: 'Start At',       value: formatDate(payment.startAt) },
                      { label: 'Next Run',       value: formatDate(payment.nextRunAt) },
                      { label: 'Last Run',       value: formatDate(payment.lastRunAt) },
                      { label: 'End At',         value: payment.endAt ? formatDate(payment.endAt) : '—' },
                      { label: 'Total Attempts', value: payment.totalAttempts },
                      { label: 'Max Retries',    value: payment.maxManualRetries },
                      { label: 'Last Attempt',   value: formatDate(payment.lastAttemptAt) },
                      { label: 'Created',        value: formatDate(payment.createdAt) },
                      { label: 'Updated',        value: formatDate(payment.updatedAt) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4">
                        <span className="text-xs text-gray-400 shrink-0 pt-0.5">{label}</span>
                        <span className="text-sm text-gray-800 text-right font-medium">{value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cancellation notice */}
              {payment.cancelledAt && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-600 mb-1">Cancelled</p>
                  <p className="text-sm text-red-700">
                    {formatDate(payment.cancelledAt)}
                    {payment.cancelledByCustomerId && (
                      <span> · By customer #{payment.cancelledByCustomerId}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Failure reason */}
              {payment.failureReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-600 mb-1">Failure Reason</p>
                  <p className="text-sm text-red-700">{payment.failureReason}</p>
                </div>
              )}

              {/* Attempts table */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Execution Attempts ({attempts.length})
                </h3>

                {attLoading ? (
                  <p className="text-sm text-gray-400">Loading attempts...</p>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-400">No attempts recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#', 'Status', 'Triggered By', 'Started At', 'Completed At', 'Tx Reference', 'Failure'].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {attempts.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-medium text-gray-700">{a.attemptNumber}</td>
                            <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                            <td className="px-3 py-3 text-gray-600">{a.triggeredBy}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(a.startedAt)}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(a.completedAt)}</td>
                            <td className="px-3 py-3">
                              {a.transactionReference ? (
                                <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {a.transactionReference}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-3 py-3 text-red-600 text-xs">{a.failureReason || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">Payment not found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const BankingScheduledPayments = () => {
  const [filters, setFilters] = useState({
    statusId: '',
    type: '',
    scheduleType: '',
    customerId: '',
    dateFrom: '',
    dateTo: '',
    pageNumber: 1,
    pageSize: 20,
  });

  const [selectedId, setSelectedId] = useState(null);

  const { data: response, isLoading, error, isFetching } = useAdminScheduledPayments(filters);

  const payments    = response?.data?.items || [];
  const totalCount  = response?.data?.totalCount || 0;
  const totalPages  = response?.data?.totalPages || 1;
  const pageNumber  = response?.data?.pageNumber || 1;
  const pageSize    = filters.pageSize;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      statusId: '', type: '', scheduleType: '',
      customerId: '', dateFrom: '', dateTo: '',
      pageNumber: 1, pageSize: 20,
    });
  };

  // Summary counts from current page data
  const summary = payments.reduce(
    (acc, p) => {
      acc.total++;
      if (p.status === 'Successful') acc.successful++;
      else if (p.status === 'Pending' || p.status === 'Processing') acc.pending++;
      else if (p.status === 'Failed' || p.status === 'Rejected') acc.failed++;
      else if (p.status === 'Cancelled') acc.cancelled++;
      return acc;
    },
    { total: 0, successful: 0, pending: 0, failed: 0, cancelled: 0 }
  );

  return (
    <Layout>
      <div className="p-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Payments</h1>
          <p className="text-gray-600 mt-1">View and monitor all customer scheduled transfers across the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex items-center gap-3">
              {isFetching && !isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </div>
              )}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.statusId}
                onChange={(e) => handleFilterChange('statusId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="3">Pending</option>
                <option value="4">Failed</option>
                <option value="5">Successful</option>
                <option value="6">Cancelled</option>
                <option value="7">Rejected</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Payout">Payout</option>
                <option value="P2P">P2P</option>
              </select>
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
              <select
                value={filters.scheduleType}
                onChange={(e) => handleFilterChange('scheduleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="OneTime">One-time</option>
                <option value="Recurring">Recurring</option>
              </select>
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
              <input
                type="number"
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                placeholder="Enter customer ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
              <select
                value={filters.pageSize}
                onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: 'Total',
              value: totalCount,
              color: 'blue',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              ),
            },
            {
              label: 'Successful',
              value: summary.successful,
              color: 'green',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
            },
            {
              label: 'Pending',
              value: summary.pending,
              color: 'yellow',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              label: 'Failed',
              value: summary.failed,
              color: 'red',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
            },
            {
              label: 'Cancelled',
              value: summary.cancelled,
              color: 'gray',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              ),
            },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                  <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">{label}</h3>
                  <p className={`text-xl font-bold text-${color}-600`}>{value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading scheduled payments</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'ID', 'Customer', 'Recipient', 'Type',
                        'Amount', 'Schedule', 'Next Run',
                        'Attempts', 'Status', 'Created', ''
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-12 text-center">
                          <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <h3 className="text-base font-medium text-gray-900">No scheduled payments found</h3>
                          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedId(payment.id)}
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            #{payment.id}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/banking/customers/${payment.customerId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              #{payment.customerId}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.targetCustomerName || payment.accountName}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              {payment.accountNumber}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-800">{payment.type}</div>
                            <div className="text-xs text-gray-400">{payment.scheduleType}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700">
                              {payment.frequency || 'One-time'}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Start: {formatDateShort(payment.startAt)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700">
                              {formatDateShort(payment.nextRunAt)}
                            </div>
                            {payment.lastRunAt && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                Last: {formatDateShort(payment.lastRunAt)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-center text-gray-700">
                            {payment.totalAttempts}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={payment.status} />
                            {payment.failureReason && (
                              <div className="text-xs text-red-500 mt-1 max-w-[140px] truncate">
                                {payment.failureReason}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDateShort(payment.createdAt)}
                          </td>
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedId(payment.id)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{' '}
                      {((pageNumber - 1) * pageSize) + 1} to{' '}
                      {Math.min(pageNumber * pageSize, totalCount)} of{' '}
                      {totalCount} scheduled payments
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const p = Math.max(1, pageNumber - 2) + i;
                          if (p > totalPages) return null;
                          return (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`px-3 py-1 text-sm rounded ${
                                p === pageNumber
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber >= totalPages}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <DetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </Layout>
  );
};

export default BankingScheduledPayments;