import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCustomerTransactions, useTransactionFilterOptions, useExportTransactions } from '../../hooks/customerHooks';

const StatusBadge = ({ status }) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    verified: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    canceled: 'bg-gray-100 text-gray-600',
    reversed: 'bg-purple-100 text-purple-800',
    inactive: 'bg-gray-100 text-gray-600',
  };
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = colors[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const DirectionBadge = ({ direction }) => {
  const isCredit = direction?.toLowerCase() === 'credit';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
      isCredit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {isCredit ? '▲' : '▼'} {direction || '—'}
    </span>
  );
};

const Val = ({ v }) => (v != null && v !== '') ? <>{v}</> : <span className="text-gray-300">—</span>;

const CopyCell = ({ value, mono = false }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-gray-300">—</span>;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center gap-1.5 min-w-[160px] max-w-[260px]">
      <span className={`flex-1 text-xs text-gray-700 truncate ${mono ? 'font-mono' : ''}`} title={value}>
        {value}
      </span>
      <button onClick={handleCopy} title={copied ? 'Copied!' : 'Copy'} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
        {copied ? (
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

const COLUMNS = [
  'Customer Name', 'Code / Tag', 'Email', 'Phone',
  'Cust. Status', 'KYC Status', 'Cust. Type', 'Company',
  'Wallet ID', 'Product ID', 'Txn Type', 'Direction',
  'Amount', 'Fee', 'Reference', 'Provider Ref',
  'Provider', 'Bank Name', 'Acct Number', 'Acct Name',
  'Narration', 'Status', 'Date',
];

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY_FILTERS = {
  reference: '',
  customerId: '',
  customerTypeCode: '',
  type: '',
  direction: '',
  status: '',
  startDate: '',
  endDate: '',
  productId: '',
  minAmount: '',
  maxAmount: '',
  pageNumber: 1,
  pageSize: 20,
};

const BankingTransactions = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data: transactionsResponse, isLoading, error, isFetching } = useCustomerTransactions(filters);
  const { data: filterOptionsResponse } = useTransactionFilterOptions();
  const exportMutation = useExportTransactions();

  const transactions = transactionsResponse?.data?.items || [];
  const pg = transactionsResponse?.data?.pagination || {};
  const filterOptions = filterOptionsResponse?.data || {};
  const typeOptions = filterOptions.types || [];
  const statusOptions = filterOptions.statuses || [];
  const productOptions = filterOptions.products || [];

  const set = (field, value) =>
    setFilters(prev => ({ ...prev, [field]: value, pageNumber: 1 }));

  const formatCurrency = (v) =>
    v != null ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(v) : '—';

  const formatDate = (v) => v ? new Date(v).toLocaleString() : '—';

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // handled by mutation's onError
    }
  };

  const summary = transactions.reduce(
    (acc, tx) => {
      acc.total++;
      const s = tx.status?.toLowerCase();
      if (s === 'success' || s === 'completed' || s === 'successful') acc.successful++;
      else if (s === 'pending' || s === 'processing') acc.pending++;
      else if (s === 'failed' || s === 'cancelled' || s === 'canceled') acc.failed++;
      return acc;
    },
    { total: 0, successful: 0, pending: 0, failed: 0 }
  );

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Banking Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all transactions across the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <div>
              <label className={labelCls}>Reference</label>
              <input type="text" value={filters.reference} onChange={e => set('reference', e.target.value)} placeholder="Search by reference…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Customer ID</label>
              <input type="number" value={filters.customerId} onChange={e => set('customerId', e.target.value)} placeholder="Customer ID" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Customer Type</label>
              <select value={filters.customerTypeCode} onChange={e => set('customerTypeCode', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Txn Type</label>
              <select value={filters.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                <option value="">All</option>
                {typeOptions.length > 0
                  ? typeOptions.map(t => <option key={t} value={t}>{t}</option>)
                  : <><option value="Funding">Funding</option><option value="Payout">Payout</option><option value="P2P">P2P</option></>
                }
              </select>
            </div>
            <div>
              <label className={labelCls}>Direction</label>
              <select value={filters.direction} onChange={e => set('direction', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={filters.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                <option value="">All</option>
                {statusOptions.length > 0
                  ? statusOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  : <><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Success">Success</option><option value="Failed">Failed</option><option value="Cancelled">Cancelled</option><option value="Reversed">Reversed</option></>
                }
              </select>
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={filters.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" value={filters.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Product</label>
              <select value={filters.productId} onChange={e => set('productId', e.target.value)} className={inputCls}>
                <option value="">All</option>
                {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Min Amount</label>
              <input type="number" value={filters.minAmount} onChange={e => set('minAmount', e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Amount</label>
              <input type="number" value={filters.maxAmount} onChange={e => set('maxAmount', e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Per Page</label>
              <select value={filters.pageSize} onChange={e => set('pageSize', parseInt(e.target.value))} className={inputCls}>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Clear Filters
            </button>
            {isFetching && (
              <span className="flex items-center text-xs text-gray-400">
                <svg className="animate-spin mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Refreshing…
              </span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: pg.total ?? 0, color: 'blue', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Successful', value: summary.successful, color: 'green', icon: 'M5 13l4 4L19 7' },
            { label: 'Pending', value: summary.pending, color: 'yellow', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Failed', value: summary.failed, color: 'red', icon: 'M6 18L18 6M6 6l12 12' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-lg shadow border border-gray-100 p-4 flex items-center gap-3">
              <div className={`p-2 bg-${color}-100 rounded-lg flex-shrink-0`}>
                <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-xl font-bold text-${color}-600`}>{value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading transactions</p>
              <p className="text-xs text-red-600 mt-0.5">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
          </div>
        )}

        {/* Summary bar + Export */}
        <div className="mb-3 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {pg.total > 0
              ? `Page ${pg.currentPage} of ${pg.totalPages} — ${pg.total} total transactions`
              : !isLoading ? 'No transactions found' : ''}
          </p>
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
              <thead className="bg-gray-50">
                <tr>
                  {COLUMNS.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {COLUMNS.map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="animate-pulse h-3 bg-gray-200 rounded w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-6 py-16 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-gray-500">No transactions found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate"><Val v={tx.customerName} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/banking/customers/${tx.customerId}`} className="text-xs font-medium text-blue-600 hover:underline block"><Val v={tx.customerCode} /></Link>
                        <div className="text-xs text-blue-400"><Val v={tx.customerTag} /></div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px] truncate"><Val v={tx.customerEmail} /></td>
                      <td className="px-4 py-3 text-xs text-gray-600"><Val v={tx.customerPhoneNumber} /></td>
                      <td className="px-4 py-3"><StatusBadge status={tx.customerStatus} /></td>
                      <td className="px-4 py-3"><StatusBadge status={tx.customerKycStatus} /></td>
                      <td className="px-4 py-3 text-xs text-gray-700"><Val v={tx.customerType} /></td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate"><Val v={tx.companyName} /></td>
                      <td className="px-4 py-3 text-xs text-gray-700">{tx.walletId ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{tx.productId ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-sm text-gray-800"><Val v={tx.type} /></td>
                      <td className="px-4 py-3"><DirectionBadge direction={tx.direction} /></td>
                      <td className={`px-4 py-3 text-sm font-semibold ${tx.direction?.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{tx.feeAmount != null ? formatCurrency(tx.feeAmount) : '—'}</td>
                      <td className="px-4 py-3">
                        <CopyCell value={tx.reference} mono />
                        <div className="text-xs text-gray-400 mt-0.5">ID: {tx.id}</div>
                      </td>
                      <td className="px-4 py-3"><CopyCell value={tx.providerReference} mono /></td>
                      <td className="px-4 py-3 text-xs text-gray-600"><Val v={tx.provider} /></td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[130px] truncate"><Val v={tx.bankName} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700"><Val v={tx.accountNumber} /></td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[130px] truncate"><Val v={tx.accountName} /></td>
                      <td className="px-4 py-3"><CopyCell value={tx.narration} /></td>
                      <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pg.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page <span className="font-medium">{pg.currentPage}</span> of{' '}
                <span className="font-medium">{pg.totalPages}</span>
              </p>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setFilters(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                  disabled={!pg.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, pg.totalPages) }, (_, i) => {
                  const cur = filters.pageNumber, tot = pg.totalPages;
                  let p;
                  if (tot <= 5) p = i + 1;
                  else if (cur <= 3) p = i + 1;
                  else if (cur >= tot - 2) p = tot - 4 + i;
                  else p = cur - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setFilters(prev => ({ ...prev, pageNumber: p }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        filters.pageNumber === p
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setFilters(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                  disabled={!pg.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BankingTransactions;