import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCustomerProfile } from '../../hooks/customerHooks';
import ApprovalRules from './ApprovalRules';
import OnboardingApprovalModal from './OnboardingApprovalModal';
import PayoutModeModal from './PayoutModeModal';

const CustomerProfile = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  // Modal states
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const { 
    data: customerResponse, 
    isLoading, 
    error 
  } = useCustomerProfile(customerId);

  const customer = customerResponse?.data;

  // Status badge component
  const StatusBadge = ({ status, type = 'status' }) => {
    const getStatusColor = (status, type) => {
      if (type === 'kyc') {
        switch (status?.toLowerCase()) {
          case 'verified': return 'bg-green-100 text-green-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      } else if (type === 'onboarding') {
        switch (status?.toLowerCase()) {
          case 'approved': return 'bg-green-100 text-green-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      } else {
        switch (status?.toLowerCase()) {
          case 'active': return 'bg-green-100 text-green-800';
          case 'inactive': return 'bg-red-100 text-red-800';
          case 'suspended': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status, type)}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 w-24 bg-gray-200 rounded mr-4"></div>
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading customer</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
                <button
                  onClick={() => navigate('/banking/customers')}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                  ← Back to Customers
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/banking/customers')}
              className="mt-4 text-sm text-primary underline hover:text-primary-dark"
            >
              ← Back to Customers
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              to="/banking/customers"
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.businessName || `${customer.firstName} ${customer.lastName}`}
              </h1>
              <p className="text-gray-600 mt-1">Customer Profile • {customer.customerCode}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <StatusBadge status={customer.status} />
            <StatusBadge status={customer.kycStatus} type="kyc" />
            <StatusBadge status={customer.onboardingStatus} type="onboarding" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Customer Type</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.customerType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Customer Code</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{customer.customerCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Customer Tag</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{customer.tag}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.companyName}</p>
                </div>
                {customer.customerType === 'Individual' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.lastName}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.firstName} {customer.lastName}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a 
                      href={`mailto:${customer.email}`} 
                      className="text-primary hover:text-primary-dark"
                    >
                      {customer.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a 
                      href={`tel:${customer.phoneNumber}`} 
                      className="text-primary hover:text-primary-dark"
                    >
                      {customer.phoneNumber}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Status</label>
                  <div className="mt-1">
                    <StatusBadge status={customer.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">KYC Status</label>
                  <div className="mt-1">
                    <StatusBadge status={customer.kycStatus} type="kyc" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Onboarding Status</label>
                  <div className="mt-1">
                    <StatusBadge status={customer.onboardingStatus} type="onboarding" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Dates */}
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Onboarding Mode</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.onboardingMode}</p>
                  </div>
                  {customer.onboardingStatus !== 'Approved' && (
                    <button
                      onClick={() => setShowOnboardingModal(true)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Approve Onboarding
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payout Mode</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.payoutMode}</p>
                  </div>
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Change Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(customer.createdAt).toLocaleString()}
                  </p>
                </div>
                {customer.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(customer.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Rules */}
            <ApprovalRules customerId={customerId} />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/banking/customers/${customerId}/transactions`}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors block"
                >
                  View Transactions
                </Link>
                <Link
                  to={`/banking/customers/${customerId}/verification`}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors block"
                >
                  Document Verification
                </Link>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  View Account Balance
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  Send Message
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  Suspend Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <OnboardingApprovalModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          customer={customer}
        />

        <PayoutModeModal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          customer={customer}
        />
      </div>
    </Layout>
  );
};

export default CustomerProfile;