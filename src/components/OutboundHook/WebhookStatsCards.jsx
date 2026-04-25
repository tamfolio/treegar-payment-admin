import React from 'react';
import { useWebhookStats } from '../../hooks/outboundWebhookHooks';

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className={`text-2xl font-bold text-gray-900`}>{value ?? '—'}</p>
    {sub && <p className={`text-xs ${color || 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const WebhookStatsCards = ({ eventType }) => {
  const { data, isLoading } = useWebhookStats(eventType);
  const stats = data?.data || {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        label="Total Deliveries"
        value={stats.totalDeliveries}
        sub="All time"
        color="text-blue-600"
      />
      <StatCard
        label="Successful"
        value={stats.successfulDeliveries}
        sub="Delivered successfully"
        color="text-green-600"
      />
      <StatCard
        label="Failed"
        value={stats.failedDeliveries}
        sub="Need attention"
        color="text-red-600"
      />
      <StatCard
        label="Pending / Retrying"
        value={(stats.pendingDeliveries ?? 0) + (stats.retryingDeliveries ?? 0)}
        sub={`${stats.pendingDeliveries ?? 0} pending · ${stats.retryingDeliveries ?? 0} retrying`}
        color="text-yellow-600"
      />
    </div>
  );
};

export default WebhookStatsCards;