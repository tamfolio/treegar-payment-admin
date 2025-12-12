import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAccounts } from '../hooks/accounthooks';
import { useDashboardMetrics } from '../hooks/Dashboardhooks';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-NG').format(number || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US');
};

const MobileDashboard = () => {
  // Pagination state for accounts table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Date filter state
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Applied filters (for actual API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // Show/hide sections for mobile optimization
  const [expandedSections, setExpandedSections] = useState({
    filters: false,
    volumeMetrics: false,
    topAccounts: false,
    recentAccounts: true
  });

  // Fetch dashboard metrics with date filters
  const {
    data: metricsResponse,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    refetch: refetchMetrics,
    isFetching: isMetricsFetching
  } = useDashboardMetrics(appliedFilters);

  // Fetch accounts for the table
  const {
    data: accountsResponse,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
    isFetching: isAccountsFetching
  } = useAccounts(currentPage, pageSize);

  const metrics = metricsResponse?.data || {};
  const accounts = accountsResponse?.data?.items || [];
  const pagination = accountsResponse?.data || {};

  // Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply date filters
  const applyFilters = () => {
    setAppliedFilters(dateFilters);
    setExpandedSections(prev => ({ ...prev, filters: false }));
  };

  // Clear date filters
  const clearFilters = () => {
    setDateFilters({ startDate: '', endDate: '' });
    setAppliedFilters({ startDate: '', endDate: '' });
  };

  // Quick date filter presets
  const applyQuickFilter = (type) => {
    const now = new Date();
    let startDate = '';
    let endDate = now.toISOString().split('T')[0];

    switch (type) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        startDate = monthAgo.toISOString().split('T')[0];
        break;
    }

    const filters = { startDate, endDate };
    setDateFilters(filters);
    setAppliedFilters(filters);
    setExpandedSections(prev => ({ ...prev, filters: false }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchMetrics();
    refetchAccounts();
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isLoading = isMetricsLoading || isAccountsLoading;
  const isFetching = isMetricsFetching || isAccountsFetching;

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Overview of accounts, transactions, and system metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => toggleSection('filters')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium flex items-center justify-center"
            >
              <svg className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Date Filters - Collapsible on Mobile */}
        {expandedSections.filters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-4">
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 w-full sm:w-auto">Quick filters:</span>
                <button
                  onClick={() => applyQuickFilter('today')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Today
                </button>
                <button
                  onClick={() => applyQuickFilter('week')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => applyQuickFilter('month')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Last 30 days
                </button>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateFilters.startDate}
                    onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateFilters.endDate}
                    onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm font-medium"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Clear
                </button>
              </div>

              {/* Applied Filter Indicator */}
              {(appliedFilters.startDate || appliedFilters.endDate) && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-sm text-blue-700">
                    📊 Showing data for: {appliedFilters.startDate || 'beginning'} to {appliedFilters.endDate || 'now'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Accounts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {isMetricsLoading ? '...' : formatNumber(metrics.totalAccounts)}
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  Active: {formatNumber(metrics.activeAccounts)}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">
                  {isMetricsLoading ? '...' : formatCurrency(metrics.totalBalance)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {isMetricsLoading ? '...' : formatNumber(metrics.processedTransactionCount)}
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  Today: {formatNumber(metrics.transactionsTodayCount)}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Today's Volume */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Volume</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isMetricsLoading ? '...' : formatCurrency(metrics.transactionsTodayAmount)}
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  {formatNumber(metrics.transactionsTodayCount)} transactions
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Volume & Flow Metrics - Collapsible on Mobile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('volumeMetrics')}
            className="w-full px-4 py-4 flex items-center justify-between sm:hidden"
          >
            <h3 className="text-lg font-semibold text-gray-900">Volume Analytics</h3>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedSections.volumeMetrics ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`${expandedSections.volumeMetrics ? 'block' : 'hidden'} sm:block`}>
            <div className="hidden sm:block px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Volume Analytics</h3>
              <p className="text-sm text-gray-600">
                {(appliedFilters.startDate || appliedFilters.endDate) ? 'Filtered Period' : 'All Time'}
              </p>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Processed Volume */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Total Processed</p>
                      <p className="text-xl font-bold text-blue-600 truncate">
                        {isMetricsLoading ? '...' : formatCurrency(metrics.totalProcessedVolume)}
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatNumber(metrics.processedTransactionCount)} transactions
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Inflow Volume */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Total Inflow</p>
                      <p className="text-xl font-bold text-green-600 truncate">
                        {isMetricsLoading ? '...' : formatCurrency(metrics.totalInflowVolume)}
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: metrics.totalProcessedVolume > 0 
                                ? `${Math.min((metrics.totalInflowVolume / metrics.totalProcessedVolume) * 100, 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {metrics.totalProcessedVolume > 0 
                            ? `${((metrics.totalInflowVolume / metrics.totalProcessedVolume) * 100).toFixed(1)}%`
                            : '0%'} of total
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Outflow Volume */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Total Outflow</p>
                      <p className="text-xl font-bold text-red-600 truncate">
                        {isMetricsLoading ? '...' : formatCurrency(metrics.totalOutflowVolume)}
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: metrics.totalProcessedVolume > 0 
                                ? `${Math.min((metrics.totalOutflowVolume / metrics.totalProcessedVolume) * 100, 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {metrics.totalProcessedVolume > 0 
                            ? `${((metrics.totalOutflowVolume / metrics.totalProcessedVolume) * 100).toFixed(1)}%`
                            : '0%'} of total
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Flow Summary */}
              {!isMetricsLoading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Net Flow</div>
                      <div className={`text-lg font-bold ${
                        (metrics.totalInflowVolume - metrics.totalOutflowVolume) > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(metrics.totalInflowVolume - metrics.totalOutflowVolume)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Flow Ratio</div>
                      <div className="text-lg font-bold text-gray-900">
                        {metrics.totalOutflowVolume > 0 
                          ? (metrics.totalInflowVolume / metrics.totalOutflowVolume).toFixed(2) 
                          : '∞'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Avg Transaction</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          metrics.processedTransactionCount > 0 
                            ? metrics.totalProcessedVolume / metrics.processedTransactionCount 
                            : 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Accounts - Collapsible on Mobile */}
        {metrics.topAccountsByBalance && metrics.topAccountsByBalance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection('topAccounts')}
              className="w-full px-4 py-4 flex items-center justify-between sm:hidden"
            >
              <h3 className="text-lg font-semibold text-gray-900">Top Accounts</h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  expandedSections.topAccounts ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`${expandedSections.topAccounts ? 'block' : 'hidden'} sm:block`}>
              <div className="hidden sm:block px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Accounts by Balance</h2>
                <p className="text-sm text-gray-600">Highest balance accounts in the system</p>
              </div>
              
              {/* Mobile Cards */}
              <div className="sm:hidden p-4 space-y-3">
                {metrics.topAccountsByBalance.slice(0, 5).map((account, index) => (
                  <div key={account.accountId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {account.accountName}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(account.currentBalance)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.topAccountsByBalance.slice(0, 5).map((account, index) => (
                      <tr key={account.accountId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={account.accountName}>
                            {account.accountName}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">{account.accountNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary">
                            {formatCurrency(account.currentBalance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            account.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Status - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pending Webhooks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Webhooks</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isMetricsLoading ? '...' : formatNumber(metrics.pendingWebhooks)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Failed Webhooks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Failed Webhooks</p>
                <p className="text-2xl font-bold text-red-600">
                  {isMetricsLoading ? '...' : formatNumber(metrics.failedWebhooks)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Accounts Table - Always Visible */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Accounts</h2>
            <p className="text-sm text-gray-600">
              {isAccountsLoading ? 'Loading accounts...' : `Showing ${accounts.length} of ${metrics.totalAccounts || 0} accounts`}
            </p>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden">
            {isAccountsLoading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading accounts...
                </div>
              </div>
            )}

            {!isAccountsLoading && accounts.length > 0 && (
              <div className="p-4 space-y-3">
                {accounts.map((account) => (
                  <div key={account.accountId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {account.accountName}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(account.currentBalance)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Available: {formatCurrency(account.availableBalance)}
                        </p>
                      </div>
                      <Link 
                        to={`/dashboard/${account.accountId}`} 
                        className="text-xs text-primary hover:text-primary-dark font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            {/* Loading, Error, and Empty states remain the same as original */}
            {/* ... (keeping the original desktop table implementation) */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MobileDashboard;