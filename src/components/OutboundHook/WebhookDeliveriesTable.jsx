import React, { useState, useEffect } from "react";
import {
  useWebhookDeliveries,
  useRetryDelivery,
  useResendByDate,
  useProcessPending,
} from "../../hooks/outboundWebhookHooks";

const statusColors = {
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  retrying: "bg-orange-100 text-orange-800",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
  >
    {status}
  </span>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

const WebhookDeliveriesTable = () => {
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 50,
    status: "",
    eventType: "",
    configurationId: "",
  });
  const [eventTypeInput, setEventTypeInput] = useState("");
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendFrom, setResendFrom] = useState("");
  const [resendTo, setResendTo] = useState("");

  // Debounce event type filter — waits 600ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, eventType: eventTypeInput, pageNumber: 1 }));
    }, 600);
    return () => clearTimeout(timer);
  }, [eventTypeInput]);

  const { data, isLoading, isError } = useWebhookDeliveries(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
  );
  const retryMutation = useRetryDelivery();
  const resendByDateMutation = useResendByDate();
  const processPendingMutation = useProcessPending();

  const deliveries = data?.data || [];

  const handleResendByDate = async () => {
    if (!resendFrom || !resendTo) return;
    await resendByDateMutation.mutateAsync({
      fromDate: resendFrom,
      toDate: resendTo,
    });
    setShowResendModal(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg
          className="animate-spin mx-auto h-6 w-6 text-primary"
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
        <p className="mt-3 text-gray-500 text-sm">Loading deliveries...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-500 text-sm">
        Failed to load webhook deliveries.
      </div>
    );
  }

  const startRecord = ((filters.pageNumber - 1) * filters.pageSize) + 1;
  const endRecord = ((filters.pageNumber - 1) * filters.pageSize) + deliveries.length;

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <input
              value={eventTypeInput}
              onChange={(e) => setEventTypeInput(e.target.value)}
              placeholder="Event type..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-44"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: e.target.value,
                  pageNumber: 1,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All statuses</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="retrying">Retrying</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => processPendingMutation.mutate()}
              disabled={processPendingMutation.isPending}
              className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {processPendingMutation.isPending ? "Processing..." : "Process Pending"}
            </button>
            <button
              onClick={() => setShowResendModal(true)}
              className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Resend by Date
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Webhook", "Event Type", "Status", "Attempts", "Last Attempt", "Response", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-xs">
                      {d.webhookConfigurationName || "—"}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">#{d.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-mono bg-blue-50 text-blue-700 rounded">
                      {d.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {d.attemptCount} / {d.maxRetries}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(d.lastAttemptAt)}
                    {d.nextRetryAt && (
                      <div className="text-yellow-600">
                        Next: {formatDate(d.nextRetryAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {d.responseStatusCode ? (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-mono rounded ${
                          d.responseStatusCode >= 200 && d.responseStatusCode < 300
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.responseStatusCode}
                      </span>
                    ) : "—"}
                    {d.errorMessage && (
                      <div
                        className="text-xs text-red-500 truncate max-w-xs mt-1"
                        title={d.errorMessage}
                      >
                        {d.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(d.status?.toLowerCase() === "failed" ||
                      d.status?.toLowerCase() === "pending") && (
                      <button
                        onClick={() => retryMutation.mutate(d.id)}
                        disabled={retryMutation.isPending}
                        className="text-xs px-3 py-1.5 border border-primary rounded-lg text-primary hover:bg-primary hover:text-white transition-colors font-medium"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deliveries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="font-medium">No deliveries found</p>
              <p className="text-sm mt-1">Adjust your filters or wait for events to arrive</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900">{deliveries.length > 0 ? startRecord : 0}</span>
              {" – "}
              <span className="font-medium text-gray-900">{endRecord}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-medium text-gray-900">{deliveries.length}</span> records on this page
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.pageNumber <= 1}
              onClick={() => setFilters((f) => ({ ...f, pageNumber: f.pageNumber - 1 }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-primary text-white rounded-lg font-medium text-sm min-w-[2.5rem] text-center">
              {filters.pageNumber}
            </span>
            <button
              disabled={deliveries.length < filters.pageSize}
              onClick={() => setFilters((f) => ({ ...f, pageNumber: f.pageNumber + 1 }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Resend by Date Modal */}
      {showResendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resend Deliveries by Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="datetime-local"
                  value={resendFrom}
                  onChange={(e) => setResendFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="datetime-local"
                  value={resendTo}
                  onChange={(e) => setResendTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowResendModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResendByDate}
                disabled={resendByDateMutation.isPending || !resendFrom || !resendTo}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {resendByDateMutation.isPending ? "Sending..." : "Resend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WebhookDeliveriesTable;