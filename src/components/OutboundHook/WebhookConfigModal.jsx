import React, { useState, useEffect } from "react";
import {
  useCreateWebhookConfig,
  useUpdateWebhookConfig,
} from "../../hooks/outboundWebhookHooks";

const EMPTY_FORM = {
  name: "",
  endpointUrl: "",
  httpMethod: "POST",
  authType: "None",
  authHeader: "",
  eventType: "",
  description: "",
  maxRetries: 3,
  timeoutSeconds: 30,
  isActive: true,
  headers: {},
};

const WebhookConfigModal = ({ isOpen, onClose, existing = null }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [error, setError] = useState("");

  const createMutation = useCreateWebhookConfig();
  const updateMutation = useUpdateWebhookConfig();
  const isEditing = !!existing;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existing) {
      setForm({ ...EMPTY_FORM, ...existing });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [existing, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addHeader = () => {
    if (!headerKey.trim()) return;
    setForm((prev) => ({
      ...prev,
      headers: { ...prev.headers, [headerKey.trim()]: headerValue },
    }));
    setHeaderKey("");
    setHeaderValue("");
  };

  const removeHeader = (key) => {
    const updated = { ...form.headers };
    delete updated[key];
    setForm((prev) => ({ ...prev, headers: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: existing.id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing
              ? "Edit Webhook Configuration"
              : "New Webhook Configuration"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="My Webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <input
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. transaction.created"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint URL *
            </label>
            <input
              name="endpointUrl"
              value={form.endpointUrl}
              onChange={handleChange}
              required
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://your-server.com/webhook"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                name="httpMethod"
                value={form.httpMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auth Type
              </label>
              <select
                name="authType"
                value={form.authType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>None</option>
                <option>Bearer</option>
                <option>Basic</option>
                <option>ApiKey</option>
              </select>
            </div>
          </div>

          {form.authType !== "None" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auth Header Value
              </label>
              <input
                name="authHeader"
                value={form.authHeader}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Token / credentials"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Retries
              </label>
              <input
                name="maxRetries"
                type="number"
                min={0}
                max={10}
                value={form.maxRetries}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <input
                name="timeoutSeconds"
                type="number"
                min={5}
                max={120}
                value={form.timeoutSeconds}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Custom Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Headers
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={headerKey}
                onChange={(e) => setHeaderKey(e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addHeader}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
            {Object.entries(form.headers || {}).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg mb-1 text-sm"
              >
                <span className="font-mono text-gray-700">
                  {k}: <span className="text-gray-500">{v}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeHeader(k)}
                  className="text-red-400 hover:text-red-600 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            >
              {isPending && (
                <svg
                  className="animate-spin w-4 h-4"
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
              )}
              {isEditing ? "Save Changes" : "Create Webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebhookConfigModal;
