import React, { useState, useCallback } from "react";
import Layout from "../components/Layout";
import {
  useFintechPayouts,
  useFintechPayout,
  useFintechPayoutsCompanies,
  useFintechCompanyWallets,
} from "../hooks/fintechPayoutsHooks";

// ── Shared ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const STATUS_MAP = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  successful: "bg-green-100 text-green-800",
  success: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  reversed: "bg-purple-100 text-purple-800",
  active: "bg-green-100 text-green-800",
};

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = STATUS_MAP[status.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const formatCurrency = (v, currency = "NGN") =>
  v != null
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(v)
    : "—";

const formatDate = (v) => (v ? new Date(v).toLocaleString() : "—");
const formatDateShort = (v) => (v ? new Date(v).toLocaleDateString() : "—");

const truncate = (str, n = 20) =>
  str && str.length > n ? str.slice(0, n) + "…" : str || "—";

// ── Copy Button ──────────────────────────────────────────────────
const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  if (!value) return null;
  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy"}
      className="ml-1 inline-flex items-center text-gray-300 hover:text-gray-600 transition-colors"
    >
      {copied ? (
        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

// Ref cell: truncated text + copy icon
const RefCell = ({ value, maxLen = 18 }) => (
  <div className="flex items-center font-mono text-xs text-gray-600 group" title={value || "—"}>
    <span>{truncate(value, maxLen)}</span>
    <CopyButton value={value} />
  </div>
);

// ── Pagination (shared) ──────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, hasNextPage, hasPreviousPage, onPageChange }) => (
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
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  </div>
);

// ── Payout Detail Modal ──────────────────────────────────────────
const DetailModal = ({ payoutId, onClose }) => {
  const { data, isLoading, error } = useFintechPayout(payoutId);
  const p = data?.data;

  if (!payoutId) return null;

  const Section = ({ title, children }) => (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h4>
      <dl className="space-y-2">{children}</dl>
    </div>
  );

  const Row = ({ label, value, mono }) => {
    if (value == null || value === "") return null;
    const isString = typeof value === "string";
    return (
      <div className="flex justify-between text-sm gap-4">
        <dt className="text-gray-500 font-medium shrink-0">{label}</dt>
        <dd className={`text-gray-900 text-right break-all flex items-center justify-end gap-1 ${mono ? "font-mono text-xs" : ""}`}>
          {value}
          {mono && isString && <CopyButton value={value} />}
        </dd>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Payout Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-5 py-4">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error?.message || "Failed to load payout details."}</p>}
          {p && (
            <>
              <Section title="Overview">
                <Row label="ID" value={p.id} />
                <Row label="Status" value={<StatusBadge status={p.status} />} />
                <Row label="Amount" value={formatCurrency(p.amount, p.currency)} />
                <Row label="Fee" value={formatCurrency(p.feeAmount, p.currency)} />
                <Row label="Currency" value={p.currency} />
              </Section>
              <Section title="Company">
                <Row label="Name" value={p.companyName} />
                <Row label="ID" value={p.companyId} />
                <Row label="Code" value={p.companyCode} mono />
                <Row label="Wallet ID" value={p.walletId} />
              </Section>
              <Section title="Beneficiary">
                <Row label="Account Number" value={p.beneficiaryAccountNumber} mono />
                <Row label="Account Name" value={p.beneficiaryAccountName} />
                <Row label="Bank" value={p.bankName} />
              </Section>
              <Section title="Provider">
                <Row label="Provider" value={p.providerName} />
                <Row label="Narration" value={p.narration} />
              </Section>
              <Section title="References">
                <Row label="Client Ref" value={p.clientReference} mono />
                <Row label="Transaction Ref" value={p.transactionReference} mono />
                <Row label="Provider Ref" value={p.providerReference} mono />
                <Row label="Internal Ref" value={p.internalReference} mono />
                {p.reversalReference && <Row label="Reversal Ref" value={p.reversalReference} mono />}
              </Section>
              {(p.failureReason || p.reversalReason) && (
                <Section title="Failure / Reversal">
                  <Row label="Failure Reason" value={p.failureReason} />
                  <Row label="Reversal Reason" value={p.reversalReason} />
                  <Row label="Reversed At" value={formatDate(p.reversedAt)} />
                </Section>
              )}
              <Section title="Timestamps">
                <Row label="Created" value={formatDate(p.createdAt)} />
                <Row label="Updated" value={formatDate(p.updatedAt)} />
                <Row label="Completed" value={formatDate(p.completedAt)} />
                {p.cancelledAt && <Row label="Cancelled" value={formatDate(p.cancelledAt)} />}
              </Section>
            </>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Company Wallets Modal ────────────────────────────────────────
const CompanyWalletsModal = ({ company, onClose }) => {
  const { data, isLoading, error } = useFintechCompanyWallets(company?.companyId);
  const wallets = data?.data || [];

  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{company.companyName}</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{company.companyCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-5 py-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Payouts", value: company.totalPayouts, color: "text-gray-900" },
              { label: "Total Amount", value: formatCurrency(company.totalPayoutAmount), color: "text-gray-900" },
              { label: "Completed", value: company.completedPayouts, color: "text-green-600" },
              { label: "Failed", value: company.failedPayouts, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Wallets */}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Wallets</h4>

          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 py-4">
              {error?.message || "Failed to load wallets."}
            </p>
          )}

          {!isLoading && !error && wallets.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No wallets found</p>
          )}

          {!isLoading && wallets.length > 0 && (
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div key={wallet.walletId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{wallet.walletType}</span>
                      <span className="ml-2 text-xs text-gray-400">#{wallet.walletId}</span>
                    </div>
                    <StatusBadge status={wallet.walletStatus} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Current Balance</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(wallet.currentBalance, wallet.currencyCode)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ledger Balance</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(wallet.ledgerBalance, wallet.currencyCode)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-xs text-gray-600">{formatDate(wallet.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="text-xs text-gray-600">{formatDate(wallet.updatedAt)}</p>
                    </div>
                  </div>
                  {wallet.accounts && wallet.accounts.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Linked Accounts</p>
                      <div className="space-y-1">
                        {wallet.accounts.map((acc) => (
                          <div key={acc.id} className="bg-gray-50 rounded p-2 text-xs flex justify-between items-start gap-2">
                            <div>
                              <span className="font-mono font-medium text-gray-800 inline-flex items-center gap-1">{acc.accountNumber}<CopyButton value={acc.accountNumber} /></span>
                              <div className="text-gray-500 mt-0.5">{acc.accountName}</div>
                              <div className="text-gray-400">Bank code: {acc.bankCode} · {acc.provider}</div>
                            </div>
                            <StatusBadge status={acc.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAYOUTS TAB
// ════════════════════════════════════════════════════════════════
const EMPTY_PAYOUT_FILTERS = {
  companyId: "", status: "", clientReference: "", transactionReference: "",
  providerReference: "", beneficiaryAccountNumber: "", minAmount: "", maxAmount: "",
  dateFrom: "", dateTo: "", search: "", pageNumber: 1, pageSize: 20,
};

const PAYOUT_COLUMNS = [
  "Company", "Beneficiary Account", "Amount", "Status",
  "Client Ref", "Transaction Ref", "Provider Ref", "Date", "Actions",
];

const PayoutsTab = () => {
  const [filters, setFilters] = useState(EMPTY_PAYOUT_FILTERS);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const { data, isLoading, error, isFetching } = useFintechPayouts(filters);

  const items = data?.data?.items || data?.data?.payouts || (Array.isArray(data?.data) ? data.data : []);
  const totalCount = data?.data?.totalCount ?? (Array.isArray(items) ? items.length : 0);
  const totalPages = data?.data?.totalPages ?? (Math.ceil(totalCount / filters.pageSize) || 0);
  const hasNextPage = data?.data?.hasNextPage ?? filters.pageNumber < totalPages;
  const hasPreviousPage = data?.data?.hasPreviousPage ?? filters.pageNumber > 1;

  const set = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Search</label>
            <input type="text" value={filters.search} onChange={(e) => set("search", e.target.value)} placeholder="Search…" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Successful">Successful</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Company ID</label>
            <input type="text" value={filters.companyId} onChange={(e) => set("companyId", e.target.value)} placeholder="Company ID" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Beneficiary Account</label>
            <input type="text" value={filters.beneficiaryAccountNumber} onChange={(e) => set("beneficiaryAccountNumber", e.target.value)} placeholder="Account number" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Client Reference</label>
            <input type="text" value={filters.clientReference} onChange={(e) => set("clientReference", e.target.value)} placeholder="Client ref" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Transaction Reference</label>
            <input type="text" value={filters.transactionReference} onChange={(e) => set("transactionReference", e.target.value)} placeholder="Transaction ref" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Provider Reference</label>
            <input type="text" value={filters.providerReference} onChange={(e) => set("providerReference", e.target.value)} placeholder="Provider ref" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Min Amount</label>
            <input type="number" value={filters.minAmount} onChange={(e) => set("minAmount", e.target.value)} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Max Amount</label>
            <input type="number" value={filters.maxAmount} onChange={(e) => set("maxAmount", e.target.value)} placeholder="Any" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Per Page</label>
            <select value={filters.pageSize} onChange={(e) => set("pageSize", parseInt(e.target.value))} className={inputCls}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setFilters(EMPTY_PAYOUT_FILTERS)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Clear Filters
          </button>
          {isFetching && (
            <span className="flex items-center text-xs text-gray-400">
              <svg className="animate-spin mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
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
            ? `Page ${filters.pageNumber} of ${totalPages} — ${totalCount} payouts`
            : !isLoading ? "No payouts found" : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-800">Error loading payouts</p>
          <p className="text-xs text-red-600 mt-0.5">{error?.message || "An unexpected error occurred."}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {PAYOUT_COLUMNS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{PAYOUT_COLUMNS.map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="animate-pulse h-3 bg-gray-200 rounded w-20" /></td>
                  ))}</tr>
                ))
              ) : !Array.isArray(items) || items.length === 0 ? (
                <tr>
                  <td colSpan={PAYOUT_COLUMNS.length} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-gray-500">No payouts found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((p, idx) => (
                  <tr key={p.id ?? idx} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.companyName || p.companyId || "—"}</div>
                      {p.companyName && p.companyId && <div className="text-xs text-gray-400">ID: {p.companyId}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-800">{p.beneficiaryAccountNumber || "—"}</div>
                      {p.beneficiaryAccountName && <div className="text-xs text-gray-400">{p.beneficiaryAccountName}</div>}
                      {p.bankName && <div className="text-xs text-gray-400">{p.bankName}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><RefCell value={p.clientReference} /></td>
                    <td className="px-4 py-3"><RefCell value={p.transactionReference} /></td>
                    <td className="px-4 py-3"><RefCell value={p.providerReference} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedPayoutId(p.id)} className="text-xs font-medium text-primary hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={filters.pageNumber}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, pageNumber: p }))}
          />
        )}
      </div>

      <DetailModal payoutId={selectedPayoutId} onClose={() => setSelectedPayoutId(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// COMPANIES TAB
// ════════════════════════════════════════════════════════════════
const EMPTY_COMPANY_FILTERS = { search: "", pageNumber: 1, pageSize: 20 };

const COMPANY_COLUMNS = [
  "Company", "Status", "Total Payouts", "Total Amount", "Completed", "Failed", "Pending", "Joined", "Actions",
];

const CompaniesTab = () => {
  const [filters, setFilters] = useState(EMPTY_COMPANY_FILTERS);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { data, isLoading, error, isFetching } = useFintechPayoutsCompanies(filters);

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? (Math.ceil(totalCount / filters.pageSize) || 0);
  const hasNextPage = data?.data?.hasNextPage ?? filters.pageNumber < totalPages;
  const hasPreviousPage = data?.data?.hasPreviousPage ?? filters.pageNumber > 1;

  const set = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value, pageNumber: 1 }));

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Search</label>
            <input type="text" value={filters.search} onChange={(e) => set("search", e.target.value)} placeholder="Company name…" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Per Page</label>
            <select value={filters.pageSize} onChange={(e) => set("pageSize", parseInt(e.target.value))} className={inputCls}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setFilters(EMPTY_COMPANY_FILTERS)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Clear Filters
          </button>
          {isFetching && (
            <span className="flex items-center text-xs text-gray-400">
              <svg className="animate-spin mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
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
            ? `Page ${filters.pageNumber} of ${totalPages} — ${totalCount} companies`
            : !isLoading ? "No companies found" : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-800">Error loading companies</p>
          <p className="text-xs text-red-600 mt-0.5">{error?.message || "An unexpected error occurred."}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {COMPANY_COLUMNS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{COMPANY_COLUMNS.map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="animate-pulse h-3 bg-gray-200 rounded w-20" /></td>
                  ))}</tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={COMPANY_COLUMNS.length} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-gray-500">No companies found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.companyId} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.companyName}</div>
                      <div className="text-xs text-gray-400 font-mono">{c.companyCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.companyStatus} />
                      {c.isApproved && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            Approved
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800 text-center">{c.totalPayouts}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800">{formatCurrency(c.totalPayoutAmount)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-600 text-center">{c.completedPayouts}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-red-600 text-center">{c.failedPayouts}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-yellow-600 text-center">{c.pendingPayouts}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateShort(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedCompany(c)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Wallets
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={filters.pageNumber}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, pageNumber: p }))}
          />
        )}
      </div>

      <CompanyWalletsModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const FintechPayouts = () => {
  const [activeTab, setActiveTab] = useState("payouts");

  const tabs = [
    { key: "payouts", label: "Payouts" },
    { key: "companies", label: "Companies" },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fintech Payouts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor and manage fintech payout transactions and companies
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
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

        {activeTab === "payouts" ? <PayoutsTab /> : <CompaniesTab />}
      </div>
    </Layout>
  );
};

export default FintechPayouts;
