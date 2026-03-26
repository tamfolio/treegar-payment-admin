import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCustomers, usePrefetchCustomerProfile } from '../../hooks/customerHooks';

const StatusBadge = ({ status, type = 'status' }) => {
  const map = {
    status:      { active: 'bg-green-100 text-green-800', inactive: 'bg-red-100 text-red-800', suspended: 'bg-yellow-100 text-yellow-800' },
    kyc:         { verified: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' },
    onboarding:  { approved: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' },
  };
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = (map[type]?.[status.toLowerCase()]) || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const formatCurrency = (v) =>
  v != null ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v) : '—';

const formatDate = (v) => v ? new Date(v).toLocaleDateString() : '—';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY_FILTERS = {
  search: '',
  companyId: '',
  customerTypeId: '',
  status: '',
  kycStatus: '',
  onboardingStatus: '',
  createdFrom: '',
  createdTo: '',
  pageNumber: 1,
  pageSize: 20,
};

const COLUMNS = [
  'Customer', 'Tag', 'Type', 'Company',
  'Email', 'Phone', 'Status', 'KYC', 'Onboarding',
  'Modes', 'Wallets', 'Balance',
  'Deposits', 'Withdrawals', 'Interest Paid',
  'Last Txn', 'Created', 'Actions',
];

const Customers = () => {
  const navigate = useNavigate();
  const prefetchCustomerProfile = usePrefetchCustomerProfile();

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data: customersResponse, isLoading, error, isFetching } = useCustomers(filters);

  const customers = customersResponse?.data?.items || [];
  const pg = customersResponse?.data?.pagination || {};

  const set = (field, value) =>
    setFilters(prev => ({ ...prev, [field]: value, pageNumber: 1 }));

  const goToCustomer = (id) => {
    prefetchCustomerProfile(id);
    navigate(`/banking/customers/${id}`);
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Banking Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage banking customer accounts and information</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Filters</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Search — exact match on code, tag, email, phone; partial on name fields */}
            <div className="xl:col-span-2">
              <label className={labelCls}>Search <span className="text-gray-400 font-normal">(code, tag, email, phone, name)</span></label>
              <input
                type="text"
                value={filters.search}
                onChange={e => set('search', e.target.value)}
                placeholder="Code, tag, email, phone, name…"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Customer Type</label>
              <select value={filters.customerTypeId} onChange={e => set('customerTypeId', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="1">Individual</option>
                <option value="2">Business</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select value={filters.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>KYC Status</label>
              <select value={filters.kycStatus} onChange={e => set('kycStatus', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Onboarding Status</label>
              <select value={filters.onboardingStatus} onChange={e => set('onboardingStatus', e.target.value)} className={inputCls}>
                <option value="">All</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Company ID</label>
              <input type="number" value={filters.companyId} onChange={e => set('companyId', e.target.value)} placeholder="Company ID" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Created From</label>
              <input type="date" value={filters.createdFrom} onChange={e => set('createdFrom', e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Created To</label>
              <input type="date" value={filters.createdTo} onChange={e => set('createdTo', e.target.value)} className={inputCls} />
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

        {/* Summary bar */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            {pg.total > 0
              ? `Page ${pg.currentPage} of ${pg.totalPages} — ${pg.total} customers`
              : !isLoading ? 'No customers found' : ''}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading customers</p>
              <p className="text-xs text-red-600 mt-0.5">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
          </div>
        )}

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
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {COLUMNS.map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="animate-pulse h-3 bg-gray-200 rounded w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-6 py-16 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-gray-500">No customers found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  customers.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => goToCustomer(c.id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors align-top"
                    >
                      {/* 1. Customer */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 max-w-[180px] truncate">
                          {c.businessName || `${c.firstName} ${c.lastName}`}
                        </div>
                        <div className="text-xs text-gray-500">{c.customerCode}</div>
                        <div className="text-xs text-gray-400">ID: {c.id}</div>
                      </td>

                      {/* 2. Tag */}
                      <td className="px-4 py-3 text-xs text-blue-500 font-medium">{c.tag || '—'}</td>

                      {/* 3. Type */}
                      <td className="px-4 py-3 text-xs text-gray-700">{c.customerType || '—'}</td>

                      {/* 4. Company */}
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate">{c.companyName || '—'}</td>

                      {/* 5. Email */}
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px] truncate">{c.email || '—'}</td>

                      {/* 6. Phone */}
                      <td className="px-4 py-3 text-xs text-gray-600">{c.phoneNumber || '—'}</td>

                      {/* 7. Status */}
                      <td className="px-4 py-3"><StatusBadge status={c.status} type="status" /></td>

                      {/* 8. KYC */}
                      <td className="px-4 py-3"><StatusBadge status={c.kycStatus} type="kyc" /></td>

                      {/* 9. Onboarding */}
                      <td className="px-4 py-3"><StatusBadge status={c.onboardingStatus} type="onboarding" /></td>

                      {/* 10. Modes */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500">Onboard: <span className="text-gray-700">{c.onboardingMode || '—'}</span></div>
                        <div className="text-xs text-gray-500">Payout: <span className="text-gray-700">{c.payoutMode || '—'}</span></div>
                      </td>

                      {/* 11. Wallets */}
                      <td className="px-4 py-3 text-xs text-gray-700 text-center">{c.walletCount ?? '—'}</td>

                      {/* 12. Balance */}
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800">{formatCurrency(c.totalWalletBalance)}</td>

                      {/* 13. Deposits */}
                      <td className="px-4 py-3 text-xs text-green-700 font-medium">{formatCurrency(c.totalDeposits)}</td>

                      {/* 14. Withdrawals */}
                      <td className="px-4 py-3 text-xs text-red-600 font-medium">{formatCurrency(c.totalWithdrawals)}</td>

                      {/* 15. Interest Paid */}
                      <td className="px-4 py-3 text-xs text-blue-600 font-medium">{formatCurrency(c.totalInterestPaid)}</td>

                      {/* 16. Last Txn */}
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.lastTransactionDate)}</td>

                      {/* 17. Created */}
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.createdAt)}</td>

                      {/* 18. Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); goToCustomer(c.id); }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View
                        </button>
                      </td>
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

export default Customers;