import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCompanyWalletTransactions } from '../hooks/transactionHooks';
import { useCompanyDetails } from '../hooks/companyhooks';
import Layout from '../components/Layout';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);

const formatDateTime = (dateString) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US'),
    time: date.toLocaleTimeString('en-US', { hour12: false }),
  };
};

const EMPTY_FILTERS = {
  walletId: '',
  type: '',
  direction: '',
  reference: '',
  fromDate: '',
  toDate: '',
  page: 1,
  pageSize: 20,
};

const CompanyWalletTransactions = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  const fromCompanyState = location.state?.fromCompany;
  const { data: companyResponse } = useCompanyDetails(companyId);
  const company = fromCompanyState || companyResponse?.data;

  const {
    data: walletTxResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCompanyWalletTransactions(companyId, activeFilters);

  const items = walletTxResponse?.data?.items || [];
  const pagination = walletTxResponse?.data || {};

  const set = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleApply = () => {
    setActiveFilters({ ...filters, page: 1 });
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
  };

  const handlePageChange = (newPage) => {
    setActiveFilters((prev) => ({ ...prev, page: newPage }));
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters =
    activeFilters.walletId ||
    activeFilters.type ||
    activeFilters.direction ||
    activeFilters.reference ||
    activeFilters.fromDate ||
    activeFilters.toDate;

  const getDirectionBadge = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'credit': return 'bg-green-100 text-green-800';
      case 'debit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Pagination = () => {
    const { pageNumber, totalPages, hasPreviousPage, hasNextPage, totalCount } = pagination;
    if (!totalPages || totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <span className="text-sm text-gray-700">
          Page {pageNumber} of {totalPages} ({totalCount} total)
        </span>
        <div className="flex items-center space-x-2">
          <button onClick={() => handlePageChange(1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">First</button>
          <button onClick={() => handlePageChange(pageNumber - 1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1 text-sm border rounded-md bg-primary text-white">{pageNumber}</span>
          <button onClick={() => handlePageChange(pageNumber + 1)} disabled={!hasNextPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
          <button onClick={() => handlePageChange(totalPages)} disabled={!hasNextPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Last</button>
        </div>
      </div>
    );
  };

  const companyLabel = company?.name || `Company ${companyId}`;

  return (
    <Layout
      title={`${companyLabel} — Wallet Transactions`}
      subtitle="Company wallet transaction history"
    >
      <div className="space-y-6">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link to="/companies" className="text-gray-400 hover:text-gray-500 transition-colors">
                    Companies
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <Link to={`/companies/${companyId}`} className="ml-4 text-gray-400 hover:text-gray-500 transition-colors">
                      {companyLabel}
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">Wallet Transactions</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{companyLabel} — Wallet Transactions</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => refetch()} disabled={isFetching} className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={() => navigate(`/companies/${companyId}`)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              Back to Company
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Transactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet ID</label>
              <input
                type="number"
                value={filters.walletId}
                onChange={(e) => set('walletId', e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) => set('type', e.target.value)}
                placeholder="e.g. InflowFee"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => set('direction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={filters.reference}
                onChange={(e) => set('reference', e.target.value)}
                placeholder="Reference or related reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => set('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => set('toDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <button onClick={handleApply} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm">
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button onClick={handleClear} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm">
                Clear
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {activeFilters.walletId && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Wallet: {activeFilters.walletId}</span>}
              {activeFilters.type && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Type: {activeFilters.type}</span>}
              {activeFilters.direction && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Direction: {activeFilters.direction}</span>}
              {activeFilters.reference && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Ref: {activeFilters.reference}</span>}
              {activeFilters.fromDate && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">From: {activeFilters.fromDate}</span>}
              {activeFilters.toDate && <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">To: {activeFilters.toDate}</span>}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Wallet Transaction History</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${pagination.totalCount ?? 0} transactions found`}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading wallet transactions...
              </div>
            </div>
          )}

          {isError && (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-600 mb-2">Failed to load wallet transactions</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Unknown error occurred'}</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {items.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Ref</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((tx, index) => {
                          const { date, time } = formatDateTime(tx.createdAt);
                          return (
                            <tr key={tx.id ?? index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{date}</div>
                                <div className="text-sm text-gray-500">{time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {tx.walletId ?? 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDirectionBadge(tx.direction)}`}>
                                  {tx.direction || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tx.type || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {tx.amount != null ? formatCurrency(tx.amount) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {tx.reference || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                {tx.relatedReference || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tx.status)}`}>
                                  {tx.status || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination />
                </>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {hasActiveFilters ? 'No Matching Transactions' : 'No Wallet Transactions'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters
                      ? 'No wallet transactions match your filters. Try adjusting your search criteria.'
                      : 'This company has no wallet transaction history yet.'}
                  </p>
                  <div className="flex justify-center space-x-4">
                    {hasActiveFilters && (
                      <button onClick={handleClear} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                        Clear Filters
                      </button>
                    )}
                    <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompanyWalletTransactions;
