import React, { useState } from 'react';
import Layout from '../components/Layout';
import WebhookStatsCards from '../components/OutboundHook/WebhookStatsCards';
import WebhookConfigsTable from '../components/OutboundHook/WebhookConfigsTable';
import WebhookDeliveriesTable from '../components/OutboundHook/WebhookDeliveriesTable';
import WebhookConfigModal from '../components/OutboundHook/WebhookConfigModal';

const OutboundHook = () => {
  const [activeTab, setActiveTab] = useState('configurations');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const handleEdit = (config) => {
    setEditingConfig(config);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingConfig(null);
  };

  return (
    <Layout
      title="Outbound Hook"
      subtitle="Manage outbound webhook configurations and monitor delivery logs"
    >
      <div className="space-y-6">
        {/* Stats */}
        <WebhookStatsCards />

        {/* Tab Navigation + Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 flex items-center justify-between">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('configurations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'configurations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔗 Configurations
              </button>
              <button
                onClick={() => setActiveTab('deliveries')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deliveries'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📬 Delivery Logs
              </button>
            </nav>

            {activeTab === 'configurations' && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 my-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Webhook
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'configurations' ? (
              <WebhookConfigsTable onEdit={handleEdit} />
            ) : (
              <WebhookDeliveriesTable />
            )}
          </div>
        </div>
      </div>

      <WebhookConfigModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        existing={editingConfig}
      />
    </Layout>
  );
};

export default OutboundHook;