import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  useAdminP2PTransactions,
  useAdminP2PPair,
} from "../../hooks/useAdminP2PTransactions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    amount
  );

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-600",
};

const getStatusBadge = (status) => (
  <span
    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-800"
    }`}
  >
    {status}
  </span>
);

const getDirectionIndicator = (direction) => {
  if (direction === "Credit") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="p-1 bg-green-100 rounded-full">
          <svg
            className="w-3 h-3 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4l-8 8h16l-8-8z"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-green-600">Credit</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="p-1 bg-red-100 rounded-full">
        <svg
          className="w-3 h-3 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20l8-8H4l8 8z"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-red-600">Debit</span>
    </div>
  );
};

// ─── Pair Modal ───────────────────────────────────────────────────────────────

const PairModal = ({ pairReference, onClose }) => {
  const { data: pairRes, isLoading } = useAdminP2PPair(pairReference);
  const pair = pairRes?.data;
  const requests = pair?.requests || [];

  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Debit leg = sender, Credit leg = receiver
  const debit = requests.find((r) => r.direction === "Debit");
  const credit = requests.find((r) => r.direction === "Credit");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-10">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                P2P Transfer Pair
              </h2>
              <p className="text-xs font-mono text-gray-500 mt-0.5">
                {pairReference}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-gray-500">Loading pair details...</p>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Amount hero */}
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Transfer Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {debit ? formatCurrency(debit.amount) : "—"}
                </p>
                <p className="text-sm text-gray-500 mt-1">{debit?.narration}</p>
                <div className="mt-2">
                  {getStatusBadge(debit?.status || "Completed")}
                </div>
              </div>

              {/* Sender → Receiver flow */}
              <div className="grid grid-cols-2 gap-4">
                {/* Sender (Debit) */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <svg
                        className="w-3.5 h-3.5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 20l8-8H4l8 8z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                      Sender (Debit)
                    </span>
                  </div>
                  {debit ? (
                    <div className="space-y-2">
                      {/* Customer ID */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Customer ID
                        </span>
                        <Link
                          to={`/banking/customers/${debit.customerId}`}
                          onClick={onClose}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          #{debit.customerId}
                        </Link>
                      </div>

                      {/* Wallet ID */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Wallet ID</span>
                        <span className="text-xs text-gray-800 font-medium">
                          {debit.walletId}
                        </span>
                      </div>

                      {/* Tx Reference — full width below label */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">
                          Tx Reference
                        </span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all leading-relaxed">
                          {debit.transactionReference}
                        </span>
                      </div>

                      {/* Completed */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Completed</span>
                        <span className="text-xs text-gray-800 font-medium">
                          {formatDate(debit.completedAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No debit leg found</p>
                  )}
                </div>

                {/* Receiver (Credit) */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <svg
                        className="w-3.5 h-3.5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4l-8 8h16l-8-8z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      Receiver (Credit)
                    </span>
                  </div>
                  {credit ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Customer ID
                        </span>
                        <Link
                          to={`/banking/customers/${credit.customerId}`}
                          onClick={onClose}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          #{credit.customerId}
                        </Link>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Wallet ID</span>
                        <span className="text-xs text-gray-800 font-medium">
                          {credit.walletId}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">
                          Tx Reference
                        </span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all leading-relaxed">
                          {credit.transactionReference}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Completed</span>
                        <span className="text-xs text-gray-800 font-medium">
                          {formatDate(credit.completedAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No credit leg found</p>
                  )}
                </div>
              </div>

              {/* Full requests table */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  All Requests in Pair ({requests.length})
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "ID",
                          "Direction",
                          "Customer",
                          "Counterparty",
                          "Amount",
                          "Status",
                          "Created",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {requests.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-medium text-gray-700">
                            #{r.id}
                          </td>
                          <td className="px-3 py-3">
                            {getDirectionIndicator(r.direction)}
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              to={`/banking/customers/${r.customerId}`}
                              onClick={onClose}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              #{r.customerId}
                            </Link>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-800">
                              {r.counterpartyName}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {r.counterpartyCustomerCode}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {formatCurrency(r.amount)}
                          </td>
                          <td className="px-3 py-3">
                            {getStatusBadge(r.status)}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {formatDateShort(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const BankingP2PTransactions = () => {
  const [filters, setFilters] = useState({
    direction: "",
    status: "",
    category: "",
    customerId: "",
    dateFrom: "",
    dateTo: "",
    pageNumber: 1,
    pageSize: 20,
  });

  const [selectedPairRef, setSelectedPairRef] = useState(null);

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useAdminP2PTransactions(filters);

  const requests = response?.data?.items || [];
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
      direction: "",
      status: "",
      category: "",
      customerId: "",
      dateFrom: "",
      dateTo: "",
      pageNumber: 1,
      pageSize: 20,
    });
  };

  // Summary counts
  const summary = requests.reduce(
    (acc, r) => {
      acc.total++;
      if (r.direction === "Credit") acc.credits++;
      if (r.direction === "Debit") acc.debits++;
      if (r.status === "Completed") acc.completed++;
      if (r.status === "Failed" || r.status === "Cancelled") acc.failed++;
      return acc;
    },
    { total: 0, credits: 0, debits: 0, completed: 0, failed: 0 }
  );

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">P2P Transactions</h1>
          <p className="text-gray-600 mt-1">
            Monitor all peer-to-peer transfers across the platform
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex items-center gap-3">
              {isFetching && !isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <select
                value={filters.direction}
                onChange={(e) =>
                  handleFilterChange("direction", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Directions</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Single">Single</option>
                <option value="Bulk">Bulk</option>
              </select>
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID
              </label>
              <input
                type="number"
                value={filters.customerId}
                onChange={(e) =>
                  handleFilterChange("customerId", e.target.value)
                }
                placeholder="Enter customer ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onChange={(e) =>
                  handleFilterChange("pageSize", parseInt(e.target.value))
                }
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "Total",
              value: totalCount,
              color: "blue",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              ),
            },
            {
              label: "Credits",
              value: summary.credits,
              color: "green",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4l-8 8h16l-8-8z"
                />
              ),
            },
            {
              label: "Debits",
              value: summary.debits,
              color: "red",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 20l8-8H4l8 8z"
                />
              ),
            },
            {
              label: "Completed",
              value: summary.completed,
              color: "green",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ),
            },
            {
              label: "Failed",
              value: summary.failed,
              color: "red",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ),
            },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="bg-white rounded-lg shadow border border-gray-200 p-5"
            >
              <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                  <svg
                    className={`w-5 h-5 text-${color}-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {icon}
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">{label}</h3>
                  <p className={`text-xl font-bold text-${color}-600`}>
                    {value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading P2P transactions
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error?.message || "An error occurred"}
                </p>
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
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "ID",
                        "Direction",
                        "Customer",
                        "Counterparty",
                        "Amount",
                        "Narration",
                        "Category",
                        "Status",
                        "Date",
                        "",
                      ].map((h) => (
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
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center">
                          <svg
                            className="mx-auto h-10 w-10 text-gray-300 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                          <h3 className="text-base font-medium text-gray-900">
                            No P2P transactions found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setSelectedPairRef(request.pairReference)
                          }
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            #{request.id}
                          </td>
                          <td className="px-4 py-4">
                            {getDirectionIndicator(request.direction)}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/banking/customers/${request.customerId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              #{request.customerId}
                            </Link>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Wallet #{request.walletId}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.counterpartyName}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                              {request.counterpartyCustomerCode}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div
                              className={`text-sm font-semibold ${
                                request.direction === "Credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {request.direction === "Credit" ? "+" : "-"}
                              {formatCurrency(request.amount)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 max-w-[160px] truncate">
                            {request.narration || "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {request.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDateShort(request.createdAt)}
                          </td>
                          <td
                            className="px-4 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setSelectedPairRef(request.pairReference)
                              }
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                            >
                              View Pair
                            </button>
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
                      {totalCount} transactions
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
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                          }
                        )}
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

      {/* Pair Modal */}
      {selectedPairRef && (
        <PairModal
          pairReference={selectedPairRef}
          onClose={() => setSelectedPairRef(null)}
        />
      )}
    </Layout>
  );
};

export default BankingP2PTransactions;
