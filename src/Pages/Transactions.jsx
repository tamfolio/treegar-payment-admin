import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAllTransactions } from '../hooks/transactionHooks';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDateTime = (dateString) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US'),
    time: date.toLocaleTimeString('en-US', { hour12: false })
  };
};

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [accountNumber, setAccountNumber] = useState('');

  // Fetch all transactions, optionally filtered by account number
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useAllTransactions(currentPage, pageSize, accountNumber);

  const transactions = transactionsResponse?.data?.items || [];
  const pagination = transactionsResponse?.data || {};

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle account number search
  const handleAccountNumberChange = (e) => {
    setAccountNumber(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get transaction type badge color
  const getTransactionTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit': return 'bg-green-100 text-green-800';
      case 'debit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination component
  const Pagination = () => {
    const { pageNumber, totalPages, hasPreviousPage, hasNextPage, totalCount } = pagination;
    
    if (!totalPages || totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>Showing page {pageNumber || currentPage} of {totalPages} ({totalCount} total transactions)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => handlePageChange(1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">First</button>
          <button onClick={() => handlePageChange((pageNumber || currentPage) - 1)} disabled={!hasPreviousPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1 text-sm border rounded-md bg-primary text-white">{pageNumber || currentPage}</span>
          <button onClick={() => handlePageChange((pageNumber || currentPage) + 1)} disabled={!hasNextPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
          <button onClick={() => handlePageChange(totalPages)} disabled={!hasNextPage} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Last</button>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title="All Transactions" 
      subtitle="View all transactions with optional account filtering"
    >
      <div className="space-y-6">
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black text-white p-2 text-xs rounded">
            Page: {currentPage} | Loading: {isLoading ? 'Yes' : 'No'} | Count: {transactions.length} | Filter: {accountNumber ? `"${accountNumber}"` : 'None (All Transactions)'}
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
            <p className="text-gray-600">
              {accountNumber ? `Showing transactions for account: ${accountNumber}` : 'View all transactions across all accounts'}
            </p>
          </div>
          
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter by Account Number (Optional) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="max-w-md">
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Account Number (Optional)
            </label>
            <input
              type="text"
              id="accountNumber"
              placeholder="Enter account number to filter (e.g., 9018323928)"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to view all transactions, or enter an account number to filter
            </p>
          </div>

          {/* Filter Status */}
          {accountNumber && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
              <p className="text-sm text-blue-700">
                Filtering transactions for account: {accountNumber}
                {transactions.length > 0 && ` (${pagination.totalCount || transactions.length} results found)`}
              </p>
              <button
                onClick={() => setAccountNumber('')}
                className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading transactions...' : `${pagination.totalCount || 0} transactions found`}
            </p>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading transactions...
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Failed to load transactions</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Please try again'}</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Try Again</button>
            </div>
          )}

          {/* Transactions Table */}
          {!isLoading && !isError && (
            <>
              {transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => {
                          const { date, time } = formatDateTime(transaction.transactionDate);
                          return (
                            <tr key={transaction.transactionId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{transaction.accountName}</div>
                                <div className="text-sm text-gray-500 font-mono">{transaction.accountNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{date}</div>
                                <div className="text-sm text-gray-500">{time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeBadge(transaction.transactionType)}`}>
                                  {transaction.transactionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-semibold ${transaction.transactionType?.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.transactionType?.toLowerCase() === 'credit' ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatCurrency(transaction.balanceAfter)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900">{transaction.transactionReference}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={transaction.description}>
                                  {transaction.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                                  {transaction.status}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                  <p className="text-gray-500 mb-4">
                    {accountNumber ? (
                      `No transactions found for account number: ${accountNumber}`
                    ) : (
                      'No transactions available at the moment.'
                    )}
                  </p>
                  {accountNumber && (
                    <button
                      onClick={() => setAccountNumber('')}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Clear Filter & View All Transactions
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Transactions;