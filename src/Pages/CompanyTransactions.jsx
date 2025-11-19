import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCompanyTransactions } from '../hooks/transactionHooks';
import { useCompanyDetails } from '../hooks/companyHooks';
import Layout from '../components/Layout';

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

const CompanyTransactions = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  console.log('🔍 CompanyTransactions - Component render:', {
    companyId,
    companyIdType: typeof companyId,
    parsedCompanyId: parseInt(companyId, 10),
    currentPage,
    pageSize
  });

  // Get company info from navigation state or fetch it
  const fromCompanyState = location.state?.fromCompany;
  
  // Fetch company details if not passed via state
  const { data: companyResponse, isLoading: companyLoading } = useCompanyDetails(companyId);
  const company = fromCompanyState || companyResponse?.data;

  console.log('🏢 Company data:', {
    fromCompanyState,
    companyResponse: companyResponse?.data,
    finalCompany: company
  });

  // Fetch company transactions
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useCompanyTransactions(companyId, currentPage, pageSize);

  console.log('📊 Company Transactions API state:', {
    companyId,
    currentPage,
    pageSize,
    isLoading,
    isError,
    error: error?.message,
    transactionsResponse,
    isFetching
  });

  const transactions = transactionsResponse?.data?.items || [];
  const pagination = transactionsResponse?.data || {};
  const hasTransactions = transactions.length > 0;

  console.log('📋 Final transactions data:', {
    transactionsCount: transactions.length,
    hasTransactions,
    pagination
  });

  // Handle pagination
  const handlePageChange = (newPage) => {
    console.log('📄 Page change:', newPage);
    setCurrentPage(newPage);
  };

  // Navigate back to company details
  const handleBackToCompany = () => {
    navigate(`/companies/${companyId}`);
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

  return (
    <Layout 
      title={company ? `${company.name} Transactions` : `Company ${companyId} Transactions`}
      subtitle={isLoading ? 'Loading transaction history...' : company ? `${company.companyCode} - Transaction History` : 'Company transaction history'}
    >
      <div className="space-y-6">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black text-white p-3 text-xs rounded space-y-1">
            <div>Company ID: {companyId} | Loading: {isLoading ? 'Yes' : 'No'} | Count: {transactions.length}</div>
            <div>API Error: {error ? error.message : 'None'}</div>
            <div>Is Fetching: {isFetching ? 'Yes' : 'No'}</div>
          </div>
        )}

        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li><Link to="/companies" className="text-gray-400 hover:text-gray-500 transition-colors">Companies</Link></li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <Link to={`/companies/${companyId}`} className="ml-4 text-gray-400 hover:text-gray-500 transition-colors">
                      {company?.name || `Company ${companyId}`}
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">Transactions</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {company ? `${company.name} Transactions` : `Company ${companyId} Transactions`}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => refetch()} disabled={isFetching} className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={handleBackToCompany}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Back to Company Details
            </button>
          </div>
        </div>

        {/* Company Summary */}
        {company && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Company Name</p>
                <p className="text-lg font-semibold text-gray-900">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Company Code</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">{company.companyCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-lg font-semibold text-primary">{pagination.totalCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                  company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {company.status}
                </span>
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading transactions for {company?.name || `Company ${companyId}`}...
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
              <p className="text-gray-600 mb-2">Failed to load transactions</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Unknown error occurred'}</p>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction, index) => {
                          const { date, time } = formatDateTime(transaction.createdAt || transaction.transactionDate);
                          return (
                            <tr key={transaction.id || transaction.transactionId || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{date}</div>
                                <div className="text-sm text-gray-500">{time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeBadge(transaction.type || transaction.transactionType)}`}>
                                  {transaction.type || transaction.transactionType || 'Transaction'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {transaction.amount ? formatCurrency(transaction.amount) : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900">
                                  {transaction.reference || transaction.transactionReference || `#${transaction.id}`}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={transaction.description}>
                                  {transaction.description || 'No description'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                                  {transaction.status || 'Unknown'}
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
                  <p className="text-gray-500 mb-4">This company currently has no transaction history.</p>
                  <div className="flex justify-center space-x-4">
                    <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Refresh</button>
                    <button onClick={handleBackToCompany} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Back to Company</button>
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

export default CompanyTransactions;