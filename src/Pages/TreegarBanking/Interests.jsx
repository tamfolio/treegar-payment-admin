import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useInterestExpenseSummary } from '../../hooks/customerHooks';

const InterestSections = () => {
  const [groupBy, setGroupBy] = useState('product'); // 'product' or 'walletType'
  
  // Date filtering state
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // Set default date range to current month
  React.useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateFilters({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
  }, []);
  
  const { 
    data: expenseResponse, 
    isLoading, 
    error,
    isFetching 
  } = useInterestExpenseSummary(dateFilters);

  const expenses = expenseResponse?.data || [];

  // Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick date filter presets
  const setQuickDateFilter = (preset) => {
    const now = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = endDate = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = startOfMonth.toISOString().split('T')[0];
        endDate = endOfMonth.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = endLastMonth.toISOString().split('T')[0];
        break;
      case 'last30Days':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setDateFilters({ startDate, endDate });
  };

  // Clear date filters
  const clearDateFilters = () => {
    setDateFilters({
      startDate: '',
      endDate: ''
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Get product icon
  const getProductIcon = (productName) => {
    switch (productName) {
      case 'BalanceFunding':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'P2PSent':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'P2PReceived':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        );
      case 'Payout':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
          </svg>
        );
      case 'InflowFee':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'WalletInterestExpense':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Get wallet type color
  const getWalletTypeColor = (walletType) => {
    return walletType === 'revenue' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Get net outflow indicator
  const getNetOutflowIndicator = (netOutflow) => {
    if (netOutflow > 0) {
      return {
        color: 'text-red-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        ),
        label: 'Outflow'
      };
    } else if (netOutflow < 0) {
      return {
        color: 'text-green-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l9.2 9.2M17 7v10H7" />
          </svg>
        ),
        label: 'Inflow'
      };
    } else {
      return {
        color: 'text-gray-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        ),
        label: 'Balanced'
      };
    }
  };

  // Group expenses by product or wallet type
  const groupedExpenses = () => {
    if (groupBy === 'product') {
      return expenses.reduce((acc, expense) => {
        const key = expense.productName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    } else {
      return expenses.reduce((acc, expense) => {
        const key = expense.walletType;
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    }
  };

  // Calculate totals
  const totals = expenses.reduce((acc, expense) => {
    acc.totalDebit += expense.totalDebit;
    acc.totalCredit += expense.totalCredit;
    acc.netOutflow += expense.netOutflow;
    return acc;
  }, { totalDebit: 0, totalCredit: 0, netOutflow: 0 });

  // Individual expense card
  const ExpenseCard = ({ expense }) => {
    const netIndicator = getNetOutflowIndicator(expense.netOutflow);

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                {getProductIcon(expense.productName)}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{expense.productName}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getWalletTypeColor(expense.walletType)}`}>
                  {expense.walletType}
                </span>
              </div>
            </div>
            <div className={`flex items-center ${netIndicator.color}`}>
              {netIndicator.icon}
              <span className="ml-1 text-xs font-medium">{netIndicator.label}</span>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-red-600 font-medium">Total Debit</div>
              <div className="text-sm font-semibold text-red-800">{formatCurrency(expense.totalDebit)}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 font-medium">Total Credit</div>
              <div className="text-sm font-semibold text-green-800">{formatCurrency(expense.totalCredit)}</div>
            </div>
          </div>

          {/* Net Outflow */}
          <div className="text-center p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-xs text-gray-600 font-medium">Net Outflow</div>
            <div className={`text-lg font-bold ${netIndicator.color}`}>
              {formatCurrency(Math.abs(expense.netOutflow))}
            </div>
          </div>

          {/* Period */}
          <div className="text-xs text-gray-500 text-center">
            Period: {new Date(expense.startDate).toLocaleDateString()} - {new Date(expense.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  // Group card component
  const GroupCard = ({ groupName, groupExpenses }) => {
    const groupTotals = groupExpenses.reduce((acc, expense) => {
      acc.totalDebit += expense.totalDebit;
      acc.totalCredit += expense.totalCredit;
      acc.netOutflow += expense.netOutflow;
      return acc;
    }, { totalDebit: 0, totalCredit: 0, netOutflow: 0 });

    const netIndicator = getNetOutflowIndicator(groupTotals.netOutflow);

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        {/* Group Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{groupName}</h2>
            <div className={`flex items-center ${netIndicator.color}`}>
              {netIndicator.icon}
              <span className="ml-1 text-sm font-medium">{formatCurrency(Math.abs(groupTotals.netOutflow))}</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Debit</div>
              <div className="text-lg font-semibold text-red-600">{formatCurrency(groupTotals.totalDebit)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Credit</div>
              <div className="text-lg font-semibold text-green-600">{formatCurrency(groupTotals.totalCredit)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Net Outflow</div>
              <div className={`text-lg font-semibold ${netIndicator.color}`}>
                {formatCurrency(Math.abs(groupTotals.netOutflow))}
              </div>
            </div>
          </div>
        </div>

        {/* Group Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupExpenses.map((expense, index) => (
              <ExpenseCard key={`${expense.productId}-${expense.walletType}-${index}`} expense={expense} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Interest Expense Summary</h1>
          <p className="text-gray-600 mt-2">Overview of interest expenses across products and wallet types</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-6">
            {/* Primary Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Group by:</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="product">Product</option>
                  <option value="walletType">Wallet Type</option>
                </select>
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

            {/* Date Filters */}
            <div className="border-t pt-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Date Range Inputs */}
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-700">Date Range:</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateFilters.startDate}
                      onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="date"
                      value={dateFilters.endDate}
                      onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {(dateFilters.startDate || dateFilters.endDate) && (
                    <button
                      onClick={clearDateFilters}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Date Presets */}
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-sm text-gray-600 mr-2">Quick select:</span>
                  {[
                    { label: 'Today', value: 'today' },
                    { label: 'Yesterday', value: 'yesterday' },
                    { label: 'This Week', value: 'thisWeek' },
                    { label: 'This Month', value: 'thisMonth' },
                    { label: 'Last Month', value: 'lastMonth' },
                    { label: 'Last 30 Days', value: 'last30Days' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setQuickDateFilter(preset.value)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Applied Filters Display */}
              {(dateFilters.startDate || dateFilters.endDate) && (
                <div className="mt-3 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Applied filters:</span>
                  <div className="flex space-x-2">
                    {dateFilters.startDate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        From: {new Date(dateFilters.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {dateFilters.endDate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        To: {new Date(dateFilters.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Debits</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalDebit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Credits</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalCredit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${totals.netOutflow >= 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {getNetOutflowIndicator(totals.netOutflow).icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Net Outflow</h3>
                <p className={`text-2xl font-bold ${getNetOutflowIndicator(totals.netOutflow).color}`}>
                  {formatCurrency(Math.abs(totals.netOutflow))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading interest data</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div>
            {expenses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Interest Data</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No interest expense data available for the current period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedExpenses()).map(([groupName, groupExpenses]) => (
                  <GroupCard 
                    key={groupName} 
                    groupName={groupName} 
                    groupExpenses={groupExpenses} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterestSections;