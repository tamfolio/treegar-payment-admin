import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useDailyBalances } from "../../hooks/useDailyBalances";
import { apiClient } from "../../apiService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount ?? 0);

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DailyBalances = () => {
  const [filters, setFilters] = useState({
    companyId: "",
    dateFrom: "",
    dateTo: "",
    pageNumber: 1,
    pageSize: 20,
  });

  const [isExporting, setIsExporting] = useState(false);

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useDailyBalances(filters);

  const items = response?.data?.items || [];
  const totalCount = response?.data?.totalCount || 0;
  const totalPages = response?.data?.totalPages || 1;
  const pageNumber = response?.data?.pageNumber || 1;
  const pageSize = filters.pageSize;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      companyId: "",
      dateFrom: "",
      dateTo: "",
      pageNumber: 1,
      pageSize: 20,
    });
  };

const handleExport = async () => {
  try {
    setIsExporting(true)

    const params = {}
    if (filters.companyId) params.CompanyId = filters.companyId
    if (filters.dateFrom)  params.DateFrom  = filters.dateFrom
    if (filters.dateTo)    params.DateTo    = filters.dateTo

    const response = await apiClient.get("/daily-balance-snapshots/export", {
      params,
      responseType: "blob",
    })

    const blob = new Blob([response.data], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.download = `daily-balance-snapshots-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error("Export error:", err)
  } finally {
    setIsExporting(false)
  }
}

  // Summary stats from current page
  const totalBalance = items.reduce((sum, item) => sum + (item.totalBalance || 0), 0);
  const avgCustomers = items.length
    ? Math.round(items.reduce((sum, item) => sum + (item.customerCount || 0), 0) / items.length)
    : 0;
  const avgWallets = items.length
    ? Math.round(items.reduce((sum, item) => sum + (item.walletCount || 0), 0) / items.length)
    : 0;

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Balances</h1>
            <p className="text-gray-600 mt-1">
              Daily balance snapshots across all companies
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex items-center gap-3">
              {isFetching && !isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </div>
              )}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company ID
              </label>
              <input
                type="number"
                value={filters.companyId}
                onChange={(e) => handleFilterChange("companyId", e.target.value)}
                placeholder="Enter company ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Page
              </label>
              <select
                value={filters.pageSize}
                onChange={(e) => handleFilterChange("pageSize", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Records",
              value: totalCount.toLocaleString(),
              color: "blue",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              ),
            },
            {
              label: "Total Balance (Page)",
              value: formatCurrency(totalBalance),
              color: "green",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              label: "Avg. Customers",
              value: avgCustomers.toLocaleString(),
              color: "purple",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              ),
            },
            {
              label: "Avg. Wallets",
              value: avgWallets.toLocaleString(),
              color: "yellow",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              ),
            },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-lg shadow border border-gray-200 p-5">
              <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                  <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <div className="ml-3 min-w-0">
                  <h3 className="text-xs font-medium text-gray-500">{label}</h3>
                  <p className={`text-lg font-bold text-${color}-600 truncate`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading daily balances</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || "An error occurred"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Date", "Company", "Total Balance", "Customers", "Wallets"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <h3 className="text-base font-medium text-gray-900">No snapshots found</h3>
                          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {formatDate(item.snapshotDate)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.companyName}</div>
                            <div className="text-xs text-gray-400 font-mono">{item.companyCode}</div>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-green-600 whitespace-nowrap">
                            {formatCurrency(item.totalBalance)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {item.customerCount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {item.walletCount?.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                      {Math.min(pageNumber * pageSize, totalCount)} of{" "}
                      {totalCount} snapshots
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const p = Math.max(1, pageNumber - 2) + i;
                          if (p > totalPages) return null;
                          return (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`px-3 py-1 text-sm rounded ${
                                p === pageNumber
                                  ? "bg-primary text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber >= totalPages}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
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

export default DailyBalances;