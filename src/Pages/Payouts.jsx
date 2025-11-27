import React, { useState } from 'react';
import Layout from '../components/Layout';
import CreatePayoutModal from '../Modals/CreatePayoutModal';
import PayoutActionModal from '../Modals/PayoutActionModal';
import { usePayouts, formatPayoutCurrency, formatPayoutDate, getPayoutStats } from '../hooks/payouthooks';

const Payouts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  // Fetch payouts data
  const {
    data: payoutsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = usePayouts(currentPage, pageSize, { status: statusFilter });

  const payouts = payoutsResponse?.data || [];
  const stats = getPayoutStats(payouts);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle status filter
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle successful payout creation
  const handlePayoutSuccess = (response) => {
    console.log('Payout created successfully:', response);
    // Refresh the payouts list
    refetch();
  };

  // Handle approve/reject payout
  const handlePayoutAction = (payout, action) => {
    setSelectedPayout(payout);
    setActionType(action);
    setShowActionModal(true);
  };

  // Handle successful approval/rejection
  const handleActionSuccess = (response) => {
    console.log('Payout action completed successfully:', response);
    // Refresh the payouts list
    refetch();
    // Reset modal state
    setShowActionModal(false);
    setSelectedPayout(null);
    setActionType(null);
  };

  // Close action modal
  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedPayout(null);
    setActionType(null);
  };

  // Format status for display
  const formatStatusDisplay = (status) => {
    switch (status) {
      case 'PendingAdminApproval':
        return 'Pending Admin Approval';
      default:
        return status;
    }
  };

  // Format approval status for display
  const formatApprovalStatusDisplay = (approvalStatus) => {
    switch (approvalStatus) {
      case 'PendingAdminApproval':
        return 'Pending Admin Approval';
      default:
        return approvalStatus;
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pendingadminapproval': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get approval status badge color
  const getApprovalBadge = (approvalStatus) => {
    switch (approvalStatus?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pendingadminapproval': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if payout can be approved/rejected
  const canApproveReject = (payout) => {
    return (payout.status === 'Pending' || payout.status === 'PendingAdminApproval') && 
           (payout.approvalStatus === 'Pending' || payout.approvalStatus === 'PendingAdminApproval') && 
           payout.requiresApproval;
  };

  return (
    <Layout 
      title="Payouts" 
      subtitle="Manage and track all your payouts and disbursements"
    >
      <div className="space-y-6">
        {/* Create Payout Modal */}
        <CreatePayoutModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePayoutSuccess}
        />

        {/* Payout Action Modal */}
        <PayoutActionModal
          isOpen={showActionModal}
          onClose={handleCloseActionModal}
          payout={selectedPayout}
          action={actionType}
          onSuccess={handleActionSuccess}
        />

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black text-white p-2 text-xs rounded">
            Page: {currentPage} | Loading: {isLoading ? 'Yes' : 'No'} | Count: {payouts.length} | Filter: {statusFilter || 'All'}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">{formatPayoutCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-blue-600">{stats.total} transactions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-green-600">{formatPayoutCurrency(stats.completedAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-yellow-600">Awaiting processing</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Failed Payouts</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            <p className="text-xs text-red-600">Requires attention</p>
          </div>
        </div>

        {/* Page Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payout Transactions</h1>
            <p className="text-gray-600">
              {statusFilter ? `Showing ${statusFilter.toLowerCase()} payouts` : 'View all payout transactions'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              New Payout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="PendingAdminApproval">Pending Admin Approval</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Clear Filters */}
            {statusFilter && (
              <div className="flex items-end">
                <button
                  onClick={() => setStatusFilter('')}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading payouts...' : `${payouts.length} payouts found`}
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
                Loading payouts...
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
              <p className="text-gray-600 mb-4">Failed to load payouts</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Please try again'}</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Try Again</button>
            </div>
          )}

          {/* Payouts Table */}
          {!isLoading && !isError && (
            <>
              {payouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payouts.map((payout) => {
                        const { date, time } = formatPayoutDate(payout.createdAt);
                        const showApprovalActions = canApproveReject(payout);
                        
                        return (
                          <tr key={payout.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">#{payout.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{payout.beneficiaryAccountName}</div>
                              <div className="text-sm text-gray-500 font-mono">{payout.beneficiaryAccountNumber}</div>
                              <div className="text-xs text-gray-400">Bank: {payout.beneficiaryBankCode}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatPayoutCurrency(payout.amount, payout.currency)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payout.status)}`}>
                                {formatStatusDisplay(payout.status)}
                              </span>
                              {payout.failureReason && (
                                <div className="text-xs text-red-600 mt-1" title={payout.failureReason}>
                                  {payout.failureReason.substring(0, 30)}...
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadge(payout.approvalStatus)}`}>
                                {formatApprovalStatusDisplay(payout.approvalStatus)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900" title={payout.transactionReference}>
                                {payout.transactionReference ? `${payout.transactionReference.substring(0, 20)}...` : 'N/A'}
                              </div>
                              {payout.providerReference && (
                                <div className="text-xs font-mono text-gray-500" title={payout.providerReference}>
                                  {payout.providerReference}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{date}</div>
                              <div className="text-sm text-gray-500">{time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Show approve/reject buttons for pending payouts */}
                                {showApprovalActions ? (
                                  <>
                                    <button 
                                      onClick={() => handlePayoutAction(payout, 'approve')}
                                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                      title="Approve this payout"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handlePayoutAction(payout, 'reject')}
                                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                      title="Reject this payout"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button className="text-primary hover:text-primary-dark">
                                    View Details
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Found</h3>
                  <p className="text-gray-500 mb-4">
                    {statusFilter ? (
                      `No payouts found with status: ${statusFilter}`
                    ) : (
                      'No payouts available at the moment.'
                    )}
                  </p>
                  {statusFilter && (
                    <button
                      onClick={() => setStatusFilter('')}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Clear Filter & View All Payouts
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

export default Payouts;