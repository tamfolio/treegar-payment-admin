import React, { useState } from "react";
import Layout from "../../components/Layout";
import {
  useOverdraftApplications,
  useOverdraftAccounts,
} from "../../hooks/overdraftHooks";
import ApproveApplicationModal from "../../Modals/Overdraft/ApproveApplicationModal";
import RejectApplicationModal from "../../Modals/Overdraft/RejectApplicationModal";
import UpdateLimitModal from "../../Modals/Overdraft/UpdateLimitModal";
import UpdateStatusModal from "../../Modals/Overdraft/UpdateStatusModal";
import WriteOffConfirmModal from "../../Modals/Overdraft/WriteOffConfirmModal";
import ViewApplicationModal from "../../Modals/Overdraft/ViewApplicationModal";

// ── Shared styling (matches Customers.js) ─────────────────────
const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

// ── Status badge helper ───────────────────────────────────────
const StatusBadge = ({ status, type = "application" }) => {
  const map = {
    application: {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    },
    account: {
      active: "bg-green-100 text-green-800",
      watchlisted: "bg-yellow-100 text-yellow-800",
      nonperforming: "bg-orange-100 text-orange-800",
      collections: "bg-red-100 text-red-800",
      writtenoff: "bg-gray-200 text-gray-700",
    },
  };
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = map[type]?.[status.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
};

const formatCurrency = (v) =>
  v != null
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(v)
    : "—";

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

// ── Empty filter shapes ───────────────────────────────────────
const EMPTY_APP_FILTERS = {
  status: "",
  pageNumber: 1,
  pageSize: 20,
};

const EMPTY_ACCOUNT_FILTERS = {
  status: "",
  customerId: "",
  minDaysOverdrawn: "",
  pageNumber: 1,
  pageSize: 20,
};

const APP_COLUMNS = [
  "Customer",
  "Email",
  "Status",
  "Submitted",
  "Reviewed",
  "Actions",
];
const ACCOUNT_COLUMNS = [
  "Customer",
  "Email",
  "Limit",
  "Outstanding",
  "Accrued Interest",
  "Status",
  "Days Overdrawn",
  "Created",
  "Actions",
];

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const Overdraft = () => {
  const [activeTab, setActiveTab] = useState("applications");

  // Modal state
  const [viewApplicationId, setViewApplicationId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [limitTarget, setLimitTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [writeOffTarget, setWriteOffTarget] = useState(null);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Overdraft Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review applications, manage active overdraft accounts, and update
            limits or statuses
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {[
              { key: "applications", label: "Applications" },
              { key: "accounts", label: "Accounts" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === "applications" ? (
          <ApplicationsTab
            onView={setViewApplicationId}
            onApprove={setApproveTarget}
            onReject={setRejectTarget}
          />
        ) : (
          <AccountsTab
            onUpdateLimit={setLimitTarget}
            onUpdateStatus={setStatusTarget}
            onWriteOff={setWriteOffTarget}
          />
        )}
      </div>

      {/* Modals */}
      <ViewApplicationModal
        applicationId={viewApplicationId}
        onClose={() => setViewApplicationId(null)}
      />
      <ApproveApplicationModal
        application={approveTarget}
        onClose={() => setApproveTarget(null)}
      />
      <RejectApplicationModal
        application={rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
      <UpdateLimitModal
        account={limitTarget}
        onClose={() => setLimitTarget(null)}
      />
      <UpdateStatusModal
        account={statusTarget}
        onClose={() => setStatusTarget(null)}
      />
      <WriteOffConfirmModal
        account={writeOffTarget}
        onClose={() => setWriteOffTarget(null)}
      />
    </Layout>
  );
};

// ════════════════════════════════════════════════════════════════
// APPLICATIONS TAB
// ════════════════════════════════════════════════════════════════
const ApplicationsTab = ({ onApprove, onReject, onView }) => {
  const [filters, setFilters] = useState(EMPTY_APP_FILTERS);

  const { data, isLoading, error, isFetching } =
    useOverdraftApplications(filters);

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = data?.data?.totalPages || 0;
  const hasNextPage = data?.data?.hasNextPage;
  const hasPreviousPage = data?.data?.hasPreviousPage;

  const set = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Filters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Per Page</label>
            <select
              value={filters.pageSize}
              onChange={(e) => set("pageSize", parseInt(e.target.value))}
              className={inputCls}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setFilters(EMPTY_APP_FILTERS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear Filters
          </button>
          {isFetching && (
            <span className="flex items-center text-xs text-gray-400">
              <svg
                className="animate-spin mr-1 h-3 w-3"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Refreshing…
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {totalCount > 0
            ? `Page ${filters.pageNumber} of ${totalPages} — ${totalCount} applications`
            : !isLoading
              ? "No applications found"
              : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-800">
            Error loading applications
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            {error?.message || "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {APP_COLUMNS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {APP_COLUMNS.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="animate-pulse h-3 bg-gray-200 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={APP_COLUMNS.length}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-gray-500">
                      No applications found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 align-top">
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {app.customerName || "—"}
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                      {app.customerEmail || "—"}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} type="application" />
                    </td>
                    {/* Submitted */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    {/* Reviewed */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {app.reviewedAt ? (
                        <>
                          {formatDate(app.reviewedAt)}
                          {app.reviewedBy && (
                            <div className="text-gray-400">
                              By #{app.reviewedBy}
                            </div>
                          )}
                          {app.rejectionReason && (
                            <div className="mt-1 text-red-600 max-w-[200px] whitespace-normal">
                              {app.rejectionReason}
                            </div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onView(app.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View
                        </button>
                        {app.status === "Pending" && (
                          <>
                            <button
                              onClick={() => onApprove(app)}
                              className="text-xs font-medium text-green-600 hover:underline"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onReject(app)}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={filters.pageNumber}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(p) =>
              setFilters((prev) => ({ ...prev, pageNumber: p }))
            }
          />
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// ACCOUNTS TAB
// ════════════════════════════════════════════════════════════════
const AccountsTab = ({ onUpdateLimit, onUpdateStatus, onWriteOff }) => {
  const [filters, setFilters] = useState(EMPTY_ACCOUNT_FILTERS);

  const { data, isLoading, error, isFetching } = useOverdraftAccounts(filters);

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = data?.data?.totalPages || 0;
  const hasNextPage = data?.data?.hasNextPage;
  const hasPreviousPage = data?.data?.hasPreviousPage;

  const set = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Filters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="WatchListed">Watch Listed</option>
              <option value="NonPerforming">Non Performing</option>
              <option value="Collections">Collections</option>
              <option value="WrittenOff">Written Off</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Customer ID</label>
            <input
              type="number"
              value={filters.customerId}
              onChange={(e) => set("customerId", e.target.value)}
              placeholder="Customer ID"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Min Days Overdrawn</label>
            <input
              type="number"
              value={filters.minDaysOverdrawn}
              onChange={(e) => set("minDaysOverdrawn", e.target.value)}
              placeholder="e.g. 30"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Per Page</label>
            <select
              value={filters.pageSize}
              onChange={(e) => set("pageSize", parseInt(e.target.value))}
              className={inputCls}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setFilters(EMPTY_ACCOUNT_FILTERS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear Filters
          </button>
          {isFetching && (
            <span className="flex items-center text-xs text-gray-400">
              <svg
                className="animate-spin mr-1 h-3 w-3"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Refreshing…
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {totalCount > 0
            ? `Page ${filters.pageNumber} of ${totalPages} — ${totalCount} accounts`
            : !isLoading
              ? "No accounts found"
              : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-800">
            Error loading accounts
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            {error?.message || "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {ACCOUNT_COLUMNS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {ACCOUNT_COLUMNS.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="animate-pulse h-3 bg-gray-200 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={ACCOUNT_COLUMNS.length}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-gray-500">
                      No accounts found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 align-top">
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {acc.customerName || "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Customer ID: {acc.customerId}
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                      {acc.customerEmail || "—"}
                    </td>
                    {/* Limit */}
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800">
                      {formatCurrency(acc.overdraftLimit)}
                    </td>
                    {/* Outstanding */}
                    <td className="px-4 py-3 text-xs text-red-600 font-medium">
                      {formatCurrency(acc.outstandingBalance)}
                    </td>
                    {/* Accrued Interest */}
                    <td className="px-4 py-3 text-xs text-purple-600 font-medium">
                      {formatCurrency(acc.accruedInterest)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={acc.status} type="account" />
                    </td>
                    {/* Days Overdrawn */}
                    <td className="px-4 py-3 text-xs text-gray-700 text-center">
                      {acc.daysOverdrawn ?? 0}
                    </td>
                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(acc.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        {/* Update Limit */}
                        <button
                          onClick={() => onUpdateLimit(acc)}
                          title="Update Limit"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </button>

                        {/* Update Status */}
                        <button
                          onClick={() => onUpdateStatus(acc)}
                          title="Update Status"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>

                        {/* Write Off */}
                        <button
                          onClick={() => onWriteOff(acc)}
                          title="Write Off"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={filters.pageNumber}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(p) =>
              setFilters((prev) => ({ ...prev, pageNumber: p }))
            }
          />
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGINATION (shared)
// ════════════════════════════════════════════════════════════════
const Pagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}) => (
  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
    <p className="text-sm text-gray-600">
      Page <span className="font-medium">{currentPage}</span> of{" "}
      <span className="font-medium">{totalPages}</span>
    </p>
    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p;
        if (totalPages <= 5) p = i + 1;
        else if (currentPage <= 3) p = i + 1;
        else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
        else p = currentPage - 2 + i;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              currentPage === p
                ? "z-10 bg-primary border-primary text-white"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </nav>
  </div>
);

export default Overdraft;
