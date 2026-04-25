import React, { useState } from 'react';
import { useWebhookConfigs, useDeleteWebhookConfig } from '../../hooks/outboundWebhookHooks';

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const WebhookConfigsTable = ({ onEdit }) => {
  const [filters, setFilters] = useState({ isActive: undefined, eventType: '' });
  const { data, isLoading, isError } = useWebhookConfigs(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined))
  );
  const deleteMutation = useDeleteWebhookConfig();
  const configs = data?.data || [];

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete webhook "${name}"? This cannot be undone.`)) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="animate-spin mx-auto h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-3 text-gray-500 text-sm">Loading configurations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-500 text-sm">
        Failed to load webhook configurations.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
        <input
          value={filters.eventType}
          onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
          placeholder="Filter by event type..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56"
        />
        <select
          value={filters.isActive === undefined ? '' : String(filters.isActive)}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              isActive: e.target.value === '' ? undefined : e.target.value === 'true',
            }))
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Event Type', 'Endpoint', 'Method', 'Status', 'Deliveries', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {configs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{config.name}</div>
                  {config.description && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">{config.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-mono bg-blue-50 text-blue-700 rounded">
                    {config.eventType}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <span className="text-xs text-gray-600 truncate block font-mono">{config.endpointUrl}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                    {config.httpMethod}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge isActive={config.isActive} />
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  <span className="text-green-600 font-medium">{config.successfulDeliveries}</span>
                  {' / '}
                  <span className="text-gray-700">{config.totalDeliveries}</span>
                  {config.failedDeliveries > 0 && (
                    <span className="ml-1 text-red-500">({config.failedDeliveries} failed)</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(config)}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config.id, config.name)}
                      disabled={deleteMutation.isPending}
                      className="text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {configs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <p className="font-medium text-gray-600">No webhook configurations found</p>
            <p className="text-sm mt-1">Create your first webhook to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookConfigsTable;