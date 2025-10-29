import React, { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useLogout, getCurrentUser } from '../hooks/authhooks';
import { useAccountTransactions } from '../hooks/transactionHooks';
import LogoutModal from '../components/LogoutModal';
import treegarLogo from '/Images/treegarlogo.svg';

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

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const user = getCurrentUser();
  
  const accountId = parseInt(id, 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pageSize = 100;

  console.log('🔍 Component render - Account ID:', accountId);

  // Simple query with no complex options
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useAccountTransactions(accountId, currentPage, pageSize);

  const transactions = transactionsResponse?.data?.items || [];
  const pagination = transactionsResponse?.data || {};
  const hasTransactions = transactions.length > 0;

  // Get account info from first transaction
  const accountInfo = hasTransactions ? {
    accountName: transactions[0].accountName,
    accountNumber: transactions[0].accountNumber,
    accountId: transactions[0].accountId
  } : null;

  const currentBalance = hasTransactions ? transactions[0].balanceAfter : 0;

  console.log('📊 Component state:', {
    isLoading,
    isError,
    transactionsCount: transactions.length,
    hasTransactions
  });

  // Handle logout - show modal instead of window.confirm
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
      },
      onError: (error) => {
        console.error('Logout error:', error);
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
      }
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
          <span>Showing page {pageNumber} of {totalPages} ({totalCount} total transactions)</span>
        </div>
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

  // Redirect if invalid account ID
  if (isNaN(accountId) || accountId <= 0) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info */}
      <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50">
        ID: {accountId} | Loading: {isLoading ? 'Yes' : 'No'} | Count: {transactions.length}
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={logoutMutation.isPending}
      />

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white h-full fixed left-0 top-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center mb-4">
            <img src={treegarLogo} alt="Treegar Logo" className="h-10 w-auto mr-3" />
          </div>
          {user && (
            <div className="text-sm">
              <p className="text-gray-300">Welcome back,</p>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}
        </div>
        <nav className="mt-8">
          <div className="px-4">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 bg-primary text-white hover:bg-primary-dark transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Dashboard
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Account Details - ID: {accountId}</h2>
              <p className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : accountInfo ? `${accountInfo.accountName} - ${accountInfo.accountNumber}` : 'Account transactions'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => refetch()} disabled={isFetching} className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={handleLogoutClick} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Header with breadcrumb */}
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li><Link to="/dashboard" className="text-gray-400 hover:text-gray-500 transition-colors">Dashboard</Link></li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-500">Account {accountId}</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : accountInfo?.accountName || `Account ${accountId}`}
              </h1>
            </div>
            <Link to="/dashboard" className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">Back to Dashboard</Link>
          </div>

          {/* Account Summary */}
          {accountInfo && hasTransactions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Name</p>
                  <p className="text-lg font-semibold text-gray-900">{accountInfo.accountName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Number</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">{accountInfo.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(currentBalance)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-lg font-semibold text-gray-900">{pagination.totalCount || 0}</p>
                </div>
              </div>
            </div>
          )}

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
                  Loading transactions for account {accountId}...
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
                <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Try Again</button>
              </div>
            )}

            {/* Show content when not loading */}
            {!isLoading && !isError && (
              <>
                {hasTransactions ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
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
                                  <div className="text-xs text-gray-500">Before: {formatCurrency(transaction.balanceBefore)}</div>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Transactions</h3>
                    <p className="text-gray-500 mb-4">This account currently has no transaction history.</p>
                    <div className="flex justify-center space-x-4">
                      <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Refresh</button>
                      <Link to="/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Back to Dashboard</Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountDetails;