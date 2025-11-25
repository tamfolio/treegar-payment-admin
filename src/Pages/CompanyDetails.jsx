import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCompanyDetails, useOnboardUser } from '../hooks/companyhooks';
import { useCompanyTransactions } from '../hooks/transactionHooks';
import OnboardUserModal from '../Modals/OnboardUserModal';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOnboardUserModal, setShowOnboardUserModal] = useState(false);

  // Fetch company details
  const { data: companyResponse, isLoading, isError, error } = useCompanyDetails(id);
  const company = companyResponse?.data;

  // Fetch company transactions (first page for preview)
  const { data: transactionsResponse, isLoading: transactionsLoading } = useCompanyTransactions(id, 1, 5);
  const transactions = transactionsResponse?.data?.items || [];

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get approval badge
  const getApprovalBadge = (isApproved) => {
    return isApproved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Handle view transactions - navigate to dedicated CompanyTransactions page
  const handleViewTransactions = () => {
    navigate(`/company-transactions/${id}`);
  };

  // Handle onboard user modal
  const handleOpenOnboardUser = () => {
    setShowOnboardUserModal(true);
  };

  const handleCloseOnboardUser = () => {
    setShowOnboardUserModal(false);
  };

  if (isLoading) {
    return (
      <Layout title="Company Details" subtitle="Loading company information...">
        <div className="p-8 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading company details...
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !company) {
    return (
      <Layout title="Company Details" subtitle="Error loading company information">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Failed to load company details</p>
          <p className="text-sm text-gray-500 mb-4">{error?.message || 'Company not found'}</p>
          <Link 
            to="/companies" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Back to Companies
          </Link>
        </div>
      </Layout>
    );
  }

  const { date: createdDate, time: createdTime } = formatDate(company.createdAt);
  const { date: approvedDate, time: approvedTime } = formatDate(company.approvedAt);

  return (
    <Layout 
      title={company.name} 
      subtitle="Detailed company profile and registration information"
    >
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-300">|</span>
          <Link to="/companies" className="text-primary hover:text-primary-dark">
            All Companies
          </Link>
        </div>

        {/* Company Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Company Logo/Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {company.name?.charAt(0) || 'C'}
                  </span>
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600 mb-2 font-mono">{company.companyCode}</p>
                
                {/* Status Badges */}
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>
                    {company.status}
                  </span>
                  
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadge(company.isApproved)}`}>
                    {company.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleOpenOnboardUser}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Onboard User</span>
              </button>
              
              <button 
                onClick={handleViewTransactions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Company ID</label>
                <p className="mt-1 text-sm text-gray-900">#{company.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{company.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Company Code</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{company.companyCode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{company.description || 'No description provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">External Reference</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{company.externalReference || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status & Approval</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusBadge(company.status)}`}>
                    {company.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Approval Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getApprovalBadge(company.isApproved)}`}>
                    {company.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </p>
              </div>

              {company.createdByAdminId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created by Admin</label>
                  <p className="mt-1 text-sm text-gray-900">Admin #{company.createdByAdminId}</p>
                </div>
              )}

              {company.approvedByAdminId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approved by Admin</label>
                  <p className="mt-1 text-sm text-gray-900">Admin #{company.approvedByAdminId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Creation Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Creation Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                <p className="mt-1 text-sm text-gray-900">{createdDate}</p>
                <p className="text-xs text-gray-500">{createdTime}</p>
              </div>

              {company.approvedAt ? (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approval Date</label>
                  <p className="mt-1 text-sm text-gray-900">{approvedDate}</p>
                  <p className="text-xs text-gray-500">{approvedTime}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approval Date</label>
                  <p className="mt-1 text-sm text-gray-500">Not yet approved</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <button 
                  onClick={handleViewTransactions}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {transactionsLoading ? (
                <div className="text-center py-4">
                  <svg className="animate-spin h-5 w-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.type || transaction.transactionType || 'Transaction'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.reference || `#${transaction.id}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.amount ? `₦${transaction.amount.toLocaleString()}` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.createdAt ? formatDate(transaction.createdAt).date : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions.length > 3 && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={handleViewTransactions}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        View {transactions.length - 3} more transactions
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Onboard User Modal */}
        <OnboardUserModal
          isOpen={showOnboardUserModal}
          onClose={handleCloseOnboardUser}
          companyId={id}
          companyName={company?.name}
        />
      </div>
    </Layout>
  );
};

export default CompanyDetails;