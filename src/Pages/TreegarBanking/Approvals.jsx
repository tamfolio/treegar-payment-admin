import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useApprovalQueue, useApproveTransfer, useRejectTransfer } from '../../hooks/customerHooks';

const Approvals = () => {
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    customerId: '',
    take: 100,
  });

  // Fetch approval queue
  const { 
    data: queueResponse, 
    isLoading, 
    error, 
    isFetching 
  } = useApprovalQueue(filters);

  const approveTransfer = useApproveTransfer();
  const rejectTransfer = useRejectTransfer();

  const transfers = queueResponse?.data || [];

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle approve transfer
  const handleApprove = async (transferId) => {
    if (window.confirm('Are you sure you want to approve this transfer?')) {
      try {
        await approveTransfer.mutateAsync(transferId);
      } catch (error) {
        console.error('Failed to approve transfer:', error);
        alert('Failed to approve transfer. Please try again.');
      }
    }
  };

  // Handle reject transfer
  const handleReject = async (transferId) => {
    if (window.confirm('Are you sure you want to reject this transfer?')) {
      try {
        await rejectTransfer.mutateAsync(transferId);
      } catch (error) {
        console.error('Failed to reject transfer:', error);
        alert('Failed to reject transfer. Please try again.');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'processed':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transfer Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve pending customer transfers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Processed">Processed</option>
              </select>
            </div>

            {/* Customer ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID
              </label>
              <input
                type="number"
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                placeholder="Enter customer ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Take (Limit) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items to show
              </label>
              <select
                value={filters.take}
                onChange={(e) => handleFilterChange('take', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4">
            <button
              onClick={() => setFilters({
                status: '',
                customerId: '',
                take: 100,
              })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-4 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">{transfers.length}</span> transfers found
            </p>
            <p className="text-yellow-600">
              <span className="font-medium">{transfers.filter(t => t.status === 'Pending').length}</span> pending
            </p>
            <p className="text-green-600">
              <span className="font-medium">{transfers.filter(t => t.status === 'Approved').length}</span> approved
            </p>
            <p className="text-red-600">
              <span className="font-medium">{transfers.filter(t => t.status === 'Rejected').length}</span> rejected
            </p>
          </div>
          {isFetching && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading transfers</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transfers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                      <td colSpan="5" className="px-6 py-4">
                        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No transfers found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        No transfers match your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ID: {transfer.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Customer: {transfer.customerId}
                          </div>
                          <div className="text-xs text-gray-400">
                            Category: {transfer.category}
                          </div>
                          {transfer.groupKey && (
                            <div className="text-xs text-gray-400">
                              Group: {transfer.groupKey}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transfer.accountName}</div>
                        <div className="text-sm text-gray-500">{transfer.accountNumber}</div>
                        <div className="text-xs text-gray-400">Bank ID: {transfer.bankId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transfer.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{transfer.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={transfer.status} />
                        {transfer.responseMessage && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transfer.responseMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(transfer.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(transfer.createdAt).toLocaleTimeString()}</div>
                        {transfer.processedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            Processed: {new Date(transfer.processedAt).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transfer.status === 'Pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(transfer.id)}
                              disabled={approveTransfer.isLoading || rejectTransfer.isLoading}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {approveTransfer.isLoading ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(transfer.id)}
                              disabled={approveTransfer.isLoading || rejectTransfer.isLoading}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {rejectTransfer.isLoading ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {transfer.processedBy ? `By: ${transfer.processedBy}` : 'No actions available'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer Details */}
        {transfers.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Amount (Pending):</span>
                <div className="font-medium">
                  {formatCurrency(
                    transfers
                      .filter(t => t.status === 'Pending')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Avg Amount:</span>
                <div className="font-medium">
                  {transfers.length > 0 
                    ? formatCurrency(transfers.reduce((sum, t) => sum + t.amount, 0) / transfers.length)
                    : '₦0.00'
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-500">Single Transfers:</span>
                <div className="font-medium">{transfers.filter(t => t.category === 'Single').length}</div>
              </div>
              <div>
                <span className="text-gray-500">Bulk Transfers:</span>
                <div className="font-medium">{transfers.filter(t => t.category === 'Bulk').length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Approvals;