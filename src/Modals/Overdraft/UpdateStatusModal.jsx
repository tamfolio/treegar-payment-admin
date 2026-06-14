import React, { useState, useEffect } from "react";
import { useUpdateOverdraftStatus } from "../../hooks/overdraftHooks";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "WatchListed", label: "Watch Listed" },
  { value: "NonPerforming", label: "Non Performing" },
  { value: "Collections", label: "Collections" },
  { value: "WrittenOff", label: "Written Off" },
];

const UpdateStatusModal = ({ account, onClose }) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const updateMutation = useUpdateOverdraftStatus();

  useEffect(() => {
    if (account) {
      setStatus(account.status || "");
      setError("");
    }
  }, [account]);

  if (!account) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status) {
      setError("Please select a status");
      return;
    }
    if (status === account.status) {
      setError("Select a different status to update");
      return;
    }

    setError("");
    updateMutation.mutate(
      {
        customerId: account.customerId,
        status,
      },
      {
        onSuccess: (data) => {
          if (data?.success === false) {
            setError(data.message || "Failed to update status");
            return;
          }
          onClose();
        },
        onError: (err) => {
          setError(
            err?.response?.data?.message || err.message || "Failed to update",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Update Account Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <p className="font-medium text-gray-900">{account.customerName}</p>
            <p className="text-xs text-gray-500">{account.customerEmail}</p>
            <p className="text-xs text-gray-400 mt-1">
              Customer ID: {account.customerId} · Current:{" "}
              <span className="font-medium">{account.status}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={updateMutation.isPending}
              autoFocus
            >
              <option value="">-- Select status --</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
