import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  useCustomerReview, 
  useReviewStatuses, 
  useUpdateDocumentStatus, 
  useUpdateVerificationStatus 
} from '../../hooks/customerHooks';

const DocumentVerification = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });

  // Hooks
  const { 
    data: reviewResponse, 
    isLoading, 
    error 
  } = useCustomerReview(customerId);

  const { data: statusesResponse } = useReviewStatuses();

  const updateDocumentStatus = useUpdateDocumentStatus();
  const updateVerificationStatus = useUpdateVerificationStatus();

  const customer = reviewResponse?.data?.profile;
  const documents = reviewResponse?.data?.documents || [];
  const verifications = reviewResponse?.data?.verifications || [];
  const documentStatuses = statusesResponse?.data?.documentStatuses || [];
  const verificationStatuses = statusesResponse?.data?.verificationStatuses || [];

  // Handle document status update
  const handleDocumentStatusUpdate = async (documentId, status, notes) => {
    try {
      await updateDocumentStatus.mutateAsync({ documentId, status, notes });
      setSelectedDocument(null);
      setStatusForm({ status: '', notes: '' });
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  // Handle verification status update
  const handleVerificationStatusUpdate = async (verificationId, status, notes) => {
    try {
      await updateVerificationStatus.mutateAsync({ verificationId, status, notes });
      setSelectedVerification(null);
      setStatusForm({ status: '', notes: '' });
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  };

  // Status badge component
  const StatusBadge = ({ status, type = 'document' }) => {
    const getStatusColor = (status, type) => {
      if (type === 'document') {
        switch (status?.toLowerCase()) {
          case 'approved': return 'bg-green-100 text-green-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      } else if (type === 'verification') {
        switch (status?.toLowerCase()) {
          case 'verified': return 'bg-green-100 text-green-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'inprogress': return 'bg-blue-100 text-blue-800';
          case 'failed': 
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status, type)}`}>
        {status}
      </span>
    );
  };

  // Document viewer component
  const DocumentViewer = ({ document }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleViewDocument = async () => {
      if (document.contentType.startsWith('image/')) {
        setImageLoading(true);
        setImageError(false);
        setShowImageModal(true);
        
        try {
          // Create a proper authenticated request
          const response = await fetch(`https://treegar-accounts-api.treegar.com:8443${document.fileUrl}`, {
            headers: {
              'x-api-key': 'treegaristhePnce@@!!!9801',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      } else {
        // For non-images, try to open in new tab with auth headers (may not work due to CORS)
        window.open(`https://treegar-accounts-api.treegar.com:8443${document.fileUrl}`, '_blank');
      }
    };

    const closeImageModal = () => {
      setShowImageModal(false);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl('');
      }
      setImageError(false);
    };

    return (
      <>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {document.documentKey.replace('_', ' ')}
              </h4>
              <p className="text-sm text-gray-500">{document.originalFileName}</p>
              <p className="text-xs text-gray-400">
                Size: {(document.fileSize / 1024).toFixed(2)} KB • {document.contentType}
              </p>
            </div>
            <StatusBadge status={document.status} type="document" />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleViewDocument}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              {document.contentType.startsWith('image/') ? 'View Image' : 'View Document'}
            </button>
            {document.status === 'Pending' && (
              <>
                <button
                  onClick={() => {
                    setSelectedDocument(document);
                    setStatusForm({ status: 'Approved', notes: '' });
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedDocument(document);
                    setStatusForm({ status: 'Rejected', notes: '' });
                  }}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedDocument(document);
                    setStatusForm({ status: '', notes: '' });
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Review
                </button>
              </>
            )}
          </div>

          {document.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Notes:</strong> {document.notes}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <div>Uploaded: {new Date(document.uploadedAt).toLocaleString()}</div>
            {document.reviewedAt && (
              <div>
                Reviewed: {new Date(document.reviewedAt).toLocaleString()}
                {document.reviewedByAdminId && (
                  <span> by Admin {document.reviewedByAdminId}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {document.documentKey.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">{document.originalFileName}</p>
                </div>
                <button
                  onClick={closeImageModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {imageLoading && (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-500">Loading image...</span>
                  </div>
                )}

                {imageError && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-4 text-sm font-medium text-gray-900">Failed to load image</h3>
                      <p className="mt-2 text-sm text-gray-500">There was an error loading the document image.</p>
                    </div>
                  </div>
                )}

                {imageUrl && !imageLoading && !imageError && (
                  <div className="text-center">
                    <img 
                      src={imageUrl} 
                      alt={document.originalFileName}
                      className="max-w-full max-h-[70vh] object-contain mx-auto"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}

                {/* Action buttons in modal */}
                {document.status === 'Pending' && (
                  <div className="flex justify-center space-x-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setStatusForm({ status: 'Approved', notes: '' });
                        closeImageModal();
                      }}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve Document
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setStatusForm({ status: 'Rejected', notes: '' });
                        closeImageModal();
                      }}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject Document
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setStatusForm({ status: '', notes: '' });
                        closeImageModal();
                      }}
                      className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Custom Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Verification item component
  const VerificationItem = ({ verification }) => {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 uppercase">{verification.type}</h4>
            <p className="text-sm text-gray-500">Value: {verification.value}</p>
            <p className="text-xs text-gray-400">
              Provider: {verification.providerName} • Ref: {verification.verificationReference}
            </p>
          </div>
          <StatusBadge status={verification.status} type="verification" />
        </div>

        <div className="flex space-x-2">
          {verification.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedVerification(verification);
                  setStatusForm({ status: 'Verified', notes: '' });
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Verify
              </button>
              <button
                onClick={() => {
                  setSelectedVerification(verification);
                  setStatusForm({ status: 'Rejected', notes: '' });
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedVerification(verification);
                  setStatusForm({ status: '', notes: '' });
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Review
              </button>
            </>
          )}
        </div>

        {verification.remarks && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Remarks:</strong> {verification.remarks}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>Created: {new Date(verification.createdAt).toLocaleString()}</div>
          {verification.updatedAt !== verification.createdAt && (
            <div>Updated: {new Date(verification.updatedAt).toLocaleString()}</div>
          )}
        </div>
      </div>
    );
  };

  // Status Update Modal
  const StatusUpdateModal = ({ isOpen, onClose, type, item, statuses, onUpdate }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (statusForm.status) {
        onUpdate(item.id, statusForm.status, statusForm.notes);
      }
    };

    const handleQuickAction = (status) => {
      onUpdate(item.id, status, statusForm.notes);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Update {type} Status
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700">
              {type === 'Document' 
                ? item.documentKey.replace('_', ' ').toUpperCase() 
                : item.type.toUpperCase()}
            </h4>
            <p className="text-sm text-gray-600">
              {type === 'Document' ? item.originalFileName : `Value: ${item.value}`}
            </p>
            <p className="text-xs text-gray-500">Current Status: {item.status}</p>
          </div>
          
          {/* Quick Action Buttons */}
          {statusForm.status && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Action: {statusForm.status}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickAction(statusForm.status)}
                  disabled={updateDocumentStatus.isLoading || updateVerificationStatus.isLoading}
                  className={`px-4 py-2 text-sm text-white rounded-md hover:opacity-90 disabled:opacity-50 ${
                    statusForm.status === 'Approved' || statusForm.status === 'Verified'
                      ? 'bg-green-600'
                      : statusForm.status === 'Rejected'
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {statusForm.status} Now
                </button>
                <button
                  onClick={() => setStatusForm({ status: '', notes: '' })}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Custom Review
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes/Remarks
              </label>
              <textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add notes about this review decision..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!statusForm.status || updateDocumentStatus.isLoading || updateVerificationStatus.isLoading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {(updateDocumentStatus.isLoading || updateVerificationStatus.isLoading) ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-6 w-24 bg-gray-200 rounded mr-4"></div>
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading customer verification data</h3>
                <p className="text-sm text-red-700 mt-1">{error?.message || 'An error occurred'}</p>
                <Link
                  to={`/banking/customers/${customerId}`}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                  ← Back to Customer Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/banking/customers"
              className="mt-4 text-sm text-primary underline hover:text-primary-dark"
            >
              ← Back to Customers
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              to={`/banking/customers/${customerId}`}
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
              <p className="text-gray-600 mt-1">
                {customer.businessName || `${customer.firstName} ${customer.lastName}`} • {customer.customerCode}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Documents ({documents.length})
              </h3>
              <div className="text-sm text-gray-500">
                Pending: {documents.filter(d => d.status === 'Pending').length} | 
                Approved: {documents.filter(d => d.status === 'Approved').length} | 
                Rejected: {documents.filter(d => d.status === 'Rejected').length}
              </div>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No documents uploaded</h3>
                <p className="mt-2 text-sm text-gray-500">Customer hasn't uploaded any documents yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {documents.map((document) => (
                  <DocumentViewer key={document.id} document={document} />
                ))}
              </div>
            )}
          </div>

          {/* Verifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Identity Verifications ({verifications.length})
              </h3>
              <div className="text-sm text-gray-500">
                Pending: {verifications.filter(v => v.status === 'Pending').length} | 
                Verified: {verifications.filter(v => v.status === 'VERIFIED').length} | 
                Failed: {verifications.filter(v => ['Failed', 'Rejected'].includes(v.status)).length}
              </div>
            </div>
            
            {verifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No verifications found</h3>
                <p className="mt-2 text-sm text-gray-500">No identity verification processes have been initiated.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {verifications.map((verification) => (
                  <VerificationItem key={verification.id} verification={verification} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Update Modals */}
        <StatusUpdateModal
          isOpen={!!selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            setStatusForm({ status: '', notes: '' });
          }}
          type="Document"
          item={selectedDocument}
          statuses={documentStatuses}
          onUpdate={handleDocumentStatusUpdate}
        />

        <StatusUpdateModal
          isOpen={!!selectedVerification}
          onClose={() => {
            setSelectedVerification(null);
            setStatusForm({ status: '', notes: '' });
          }}
          type="Verification"
          item={selectedVerification}
          statuses={verificationStatuses}
          onUpdate={handleVerificationStatusUpdate}
        />
      </div>
    </Layout>
  );
};

export default DocumentVerification;