import React from 'react';
import { useOverdraftApplication } from '../../hooks/overdraftHooks';

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cls = map[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-b-0">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">
      {value ?? '—'}
    </span>
  </div>
);

const ViewApplicationModal = ({ applicationId, onClose }) => {
  const { data, isLoading, error } = useOverdraftApplication(applicationId);

  if (!applicationId) return null;

  const application = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Application Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">Application ID: {applicationId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-500">Loading application details...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm">
              <p className="font-medium text-red-800">Failed to load application</p>
              <p className="text-xs text-red-600 mt-1">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
          ) : !application ? (
            <p className="text-sm text-gray-500 text-center py-8">No application data found.</p>
          ) : (
            <>
              {/* Status pill at top */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                <StatusBadge status={application.status} />
              </div>

              {/* Customer info */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Customer
                </h4>
                <Row label="Name" value={application.customerName} />
                <Row label="Email" value={application.customerEmail} />
                <Row label="Customer ID" value={application.customerId} />
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Timeline
                </h4>
                <Row label="Submitted" value={formatDate(application.createdAt)} />
                <Row label="Reviewed" value={formatDate(application.reviewedAt)} />
                <Row
                  label="Reviewed By"
                  value={application.reviewedBy ? `Admin #${application.reviewedBy}` : '—'}
                />
              </div>

              {/* Rejection reason */}
              {application.rejectionReason && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Rejection Reason
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                    {application.rejectionReason}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;