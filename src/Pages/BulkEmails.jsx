import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  useBulkEmails,
  useBulkEmail,
  useSendBulkEmail,
} from "../hooks/bulkEmailHooks";
import { useCompanies, formatCompanyOptions } from "../hooks/companyhooks";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const formatDate = (v) => (v ? new Date(v).toLocaleString() : "—");

const EMPTY_FILTERS = { companyId: "", pageNumber: 1, pageSize: 50 };

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls =
    STATUS_STYLES[status.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
};

const ProgressBar = ({ sent, failed, total }) => {
  if (!total) return null;
  const sentPct = Math.round((sent / total) * 100);
  const failedPct = Math.round((failed / total) * 100);
  return (
    <div className="w-32">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200">
        <div
          className="bg-green-500"
          style={{ width: `${sentPct}%` }}
        />
        <div
          className="bg-red-400"
          style={{ width: `${failedPct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {sent}/{total} sent
        {failed > 0 && `, ${failed} failed`}
      </p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// DETAIL DRAWER — single job live view
// ════════════════════════════════════════════════════════════════
const JobDetailDrawer = ({ jobId, onClose }) => {
  const isActive = !!jobId;

  const { data, isLoading } = useBulkEmail(jobId, {
    enabled: isActive,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status?.toLowerCase();
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });

  const job = data?.data;

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Job Detail</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {job && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={job.status} />
              {(job.status?.toLowerCase() === "pending" ||
                job.status?.toLowerCase() === "processing") && (
                <span className="text-xs text-gray-400 animate-pulse">
                  Auto-refreshing…
                </span>
              )}
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className={labelCls}>Subject</dt>
                <dd className="font-medium text-gray-900">{job.subject}</dd>
              </div>
              {job.companyId && (
                <div>
                  <dt className={labelCls}>Company ID</dt>
                  <dd className="text-gray-700">{job.companyId}</dd>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <dt className={labelCls}>Total</dt>
                  <dd className="font-semibold text-gray-900">
                    {job.totalRecipients ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className={labelCls}>Sent</dt>
                  <dd className="font-semibold text-green-700">
                    {job.sentCount ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className={labelCls}>Failed</dt>
                  <dd className="font-semibold text-red-600">
                    {job.failedCount ?? 0}
                  </dd>
                </div>
              </div>

              {job.totalRecipients > 0 && (
                <div>
                  <dt className={labelCls}>Progress</dt>
                  <dd>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200 mt-1">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${Math.round(
                            ((job.sentCount + job.failedCount) /
                              job.totalRecipients) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(
                        ((job.sentCount + job.failedCount) /
                          job.totalRecipients) *
                          100
                      )}
                      % processed
                    </p>
                  </dd>
                </div>
              )}

              <div>
                <dt className={labelCls}>Created</dt>
                <dd className="text-gray-700">{formatDate(job.createdAt)}</dd>
              </div>
              <div>
                <dt className={labelCls}>Started</dt>
                <dd className="text-gray-700">{formatDate(job.startedAt)}</dd>
              </div>
              <div>
                <dt className={labelCls}>Completed</dt>
                <dd className="text-gray-700">
                  {formatDate(job.completedAt)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// SEND TAB
// ════════════════════════════════════════════════════════════════
const SendTab = ({ onSent }) => {
  const [form, setForm] = useState({ companyId: "", subject: "", body: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies();
  const companies = companiesResponse?.data?.items || [];
  const companyOptions = formatCompanyOptions(companies);

  const sendMutation = useSendBulkEmail();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.companyId) {
      setError("Please select a company");
      return;
    }
    if (!form.subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (form.subject.length > 255) {
      setError("Subject must be 255 characters or fewer");
      return;
    }
    if (!form.body.trim()) {
      setError("Body is required");
      return;
    }
    setError("");

    sendMutation.mutate(
      {
        companyId: parseInt(form.companyId),
        subject: form.subject,
        body: form.body,
      },
      {
        onSuccess: (res) => {
          if (res?.success === false) {
            setError(res.message || "Failed to send bulk email");
            return;
          }
          setSuccess(`Job created — ID #${res?.data?.id}. Sending in the background.`);
          setForm({ companyId: "", subject: "", body: "" });
          setTimeout(() => setSuccess(""), 6000);
          onSent();
        },
        onError: (err) => {
          setError(
            err?.response?.data?.message || err.message || "Failed to send bulk email"
          );
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Send Bulk Email
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Company</label>
          {loadingCompanies ? (
            <div className="flex items-center gap-3 py-2">
              <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading companies…</p>
            </div>
          ) : (
            <select
              value={form.companyId}
              onChange={(e) => setForm((p) => ({ ...p, companyId: e.target.value }))}
              className={inputCls}
              disabled={sendMutation.isPending}
            >
              <option value="">— Select a company —</option>
              {companyOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelCls}>
            Subject{" "}
            <span className="text-gray-400 font-normal">(max 255 chars)</span>
          </label>
          <input
            type="text"
            maxLength={255}
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Email subject line"
            className={inputCls}
            disabled={sendMutation.isPending}
          />
          <p className="text-xs text-gray-400 mt-0.5 text-right">
            {form.subject.length}/255
          </p>
        </div>

        <div>
          <label className={labelCls}>Body</label>
          <textarea
            rows={8}
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder="Email body content"
            className={inputCls}
            disabled={sendMutation.isPending}
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {sendMutation.isPending ? "Sending…" : "Send Bulk Email"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// HISTORY TAB
// ════════════════════════════════════════════════════════════════
const HISTORY_COLUMNS = [
  "ID",
  "Subject",
  "Company",
  "Status",
  "Progress",
  "Created",
  "Completed",
  "Actions",
];

const HistoryTab = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const { data, isLoading, isFetching, error } = useBulkEmails(filters, {
    refetchInterval: (query) => {
      const items = query.state.data?.data?.items ?? [];
      const hasActive = items.some((j) => {
        const s = j.status?.toLowerCase();
        return s === "pending" || s === "processing";
      });
      return hasActive ? 5000 : false;
    },
  });

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Company ID</label>
            <input
              type="number"
              value={filters.companyId}
              onChange={(e) => set("companyId", e.target.value)}
              placeholder="All companies"
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
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear Filters
          </button>
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
            ? `Page ${filters.pageNumber} of ${totalPages} — ${totalCount} jobs`
            : !isLoading
            ? "No jobs found"
            : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-800">Error loading jobs</p>
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
                {HISTORY_COLUMNS.map((h) => (
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
                <tr>
                  <td colSpan={HISTORY_COLUMNS.length} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-sm text-gray-500">Loading jobs…</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={HISTORY_COLUMNS.length}
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-gray-500">
                      No bulk email jobs found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Send your first bulk email from the Send tab.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-xs text-gray-500">#{job.id}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate">
                      <span
                        className="font-medium text-gray-900"
                        title={job.subject}
                      >
                        {job.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {job.companyId ? `#${job.companyId}` : "Global"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar
                        sent={job.sentCount ?? 0}
                        failed={job.failedCount ?? 0}
                        total={job.totalRecipients ?? 0}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(job.completedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedJobId(job.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page <span className="font-medium">{filters.pageNumber}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() =>
                  setFilters((p) => ({ ...p, pageNumber: p.pageNumber - 1 }))
                }
                disabled={!hasPreviousPage}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() =>
                  setFilters((p) => ({ ...p, pageNumber: p.pageNumber + 1 }))
                }
                disabled={!hasNextPage}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      <JobDetailDrawer
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const BulkEmails = () => {
  const [activeTab, setActiveTab] = useState("send");

  const handleSent = () => setActiveTab("history");

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Emails</h1>
          <p className="text-gray-500 text-sm mt-1">
            Send email campaigns to customers and track delivery progress
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {[
              { key: "send", label: "Send Email" },
              { key: "history", label: "History" },
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

        {activeTab === "send" ? (
          <SendTab onSent={handleSent} />
        ) : (
          <HistoryTab />
        )}
      </div>
    </Layout>
  );
};

export default BulkEmails;
