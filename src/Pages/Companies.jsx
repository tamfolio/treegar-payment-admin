import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import OnboardCompanyModal from '../Modals/OnboardCompaniesModal';
import { useCompaniesList } from '../hooks/companyhooks';
import { useNavigate } from 'react-router-dom';

const Companies = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  const navigate = useNavigate();

  // Fetch companies data
  const { data: companiesResponse, isLoading, isError, error, refetch, isFetching } = useCompaniesList();
  const companies = companiesResponse?.data || [];

  // Get company statistics and filtered data
  const companyStats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(company => company.status === 'Active').length;
    const pendingCompanies = companies.filter(company => company.status === 'Pending').length;
    const approvedCompanies = companies.filter(company => company.isApproved === true).length;

    return {
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      approvedCompanies
    };
  }, [companies]);

  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Status filter
      if (statusFilter === 'active' && company.status !== 'Active') return false;
      if (statusFilter === 'pending' && company.status !== 'Pending') return false;

      // Approval filter
      if (approvalFilter === 'approved' && !company.isApproved) return false;
      if (approvalFilter === 'pending' && company.isApproved) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          company.name?.toLowerCase().includes(searchLower) ||
          company.companyCode?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [companies, statusFilter, approvalFilter, searchTerm]);

  // Handle company row click
  const handleCompanyClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  // Handle successful onboarding
  const handleOnboardSuccess = (response) => {
    console.log('Company onboarded successfully:', response);
    // Refresh the companies list
    refetch();
  };

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
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Layout 
      title="Companies" 
      subtitle="Manage company registrations and approvals"
    >
      <div className="space-y-6">
        {/* Onboard Company Modal */}
        <OnboardCompanyModal
          isOpen={showOnboardModal}
          onClose={() => setShowOnboardModal(false)}
          onSuccess={handleOnboardSuccess}
        />

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black text-white p-2 text-xs rounded">
            Loading: {isLoading ? 'Yes' : 'No'} | Companies: {companies.length} | Error: {isError ? 'Yes' : 'No'}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Companies</h3>
            <p className="text-2xl font-bold text-gray-900">{companyStats.totalCompanies}</p>
            <p className="text-xs text-blue-600">Registered companies</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Companies</h3>
            <p className="text-2xl font-bold text-gray-900">{companyStats.activeCompanies}</p>
            <p className="text-xs text-green-600">Currently operational</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <p className="text-2xl font-bold text-gray-900">{companyStats.pendingCompanies}</p>
            <p className="text-xs text-yellow-600">Awaiting review</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Approved Companies</h3>
            <p className="text-2xl font-bold text-gray-900">{companyStats.approvedCompanies}</p>
            <p className="text-xs text-indigo-600">Verified and approved</p>
          </div>
        </div>

        {/* Page Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Directory</h1>
            <p className="text-gray-600">
              {filteredCompanies.length} of {companyStats.totalCompanies} companies displayed
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
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Onboard Company
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Companies
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or company code..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Approval Filter */}
            <div>
              <label htmlFor="approvalFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Approval
              </label>
              <select
                id="approvalFilter"
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Approvals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {(statusFilter !== 'all' || approvalFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setApprovalFilter('all');
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Company Registry</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading companies...' : `${filteredCompanies.length} companies found`}
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
                Loading companies...
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
              <p className="text-gray-600 mb-4">Failed to load companies</p>
              <p className="text-sm text-gray-500 mb-4">{error?.message || 'Please try again'}</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Companies Table */}
          {!isLoading && !isError && (
            <>
              {filteredCompanies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCompanies.map((company) => {
                        const { date: createdDate, time: createdTime } = formatDate(company.createdAt);
                        const { date: approvedDate, time: approvedTime } = formatDate(company.approvedAt);
                        
                        return (
                          <tr 
                            key={company.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCompanyClick(company.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {company.name?.charAt(0) || 'C'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                  <div className="text-sm text-gray-500">ID: #{company.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900">{company.companyCode}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(company.status)}`}>
                                {company.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalBadge(company.isApproved)}`}>
                                {company.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{createdDate}</div>
                              <div className="text-sm text-gray-500">{createdTime}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {company.approvedAt ? (
                                <>
                                  <div className="text-sm text-gray-900">{approvedDate}</div>
                                  <div className="text-sm text-gray-500">{approvedTime}</div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">Not approved yet</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompanyClick(company.id);
                                }}
                                className="text-primary hover:text-primary-dark"
                              >
                                View Details
                              </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || approvalFilter !== 'all' ? (
                      'No companies match your current filters.'
                    ) : (
                      'No companies are currently registered.'
                    )}
                  </p>
                  {(searchTerm || statusFilter !== 'all' || approvalFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setApprovalFilter('all');
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors mr-2"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setShowOnboardModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Onboard First Company
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;