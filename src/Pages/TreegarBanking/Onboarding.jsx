import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { 
  useKYCRequirements, 
  useDocumentRequirements, 
  useUpdateKYCRequirements,
  useUpdateDocumentRequirements
} from '../../hooks/customerHooks';

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Individual Requirements
  const { 
    data: individualKYCResponse, 
    isLoading: individualKYCLoading 
  } = useKYCRequirements('Individual');

  // Business Requirements
  const { 
    data: businessKYCResponse, 
    isLoading: businessKYCLoading 
  } = useKYCRequirements('Business');

  const { 
    data: businessDocResponse, 
    isLoading: businessDocLoading 
  } = useDocumentRequirements('Business');

  // Mutations
  const updateKYCRequirements = useUpdateKYCRequirements();
  const updateDocumentRequirements = useUpdateDocumentRequirements();

  const individualKYC = individualKYCResponse?.data || [];
  const businessKYC = businessKYCResponse?.data || [];
  const businessDocuments = businessDocResponse?.data || [];

  // State for tracking changes
  const [individualKYCState, setIndividualKYCState] = useState([]);
  const [businessKYCState, setBusinessKYCState] = useState([]);
  const [businessDocState, setBusinessDocState] = useState([]);

  // Initialize state when data loads
  React.useEffect(() => {
    if (individualKYC.length > 0) setIndividualKYCState([...individualKYC]);
  }, [individualKYC]);

  React.useEffect(() => {
    if (businessKYC.length > 0) setBusinessKYCState([...businessKYC]);
  }, [businessKYC]);

  React.useEffect(() => {
    if (businessDocuments.length > 0) setBusinessDocState([...businessDocuments]);
  }, [businessDocuments]);

  // Handle KYC requirement changes
  const handleKYCChange = (id, field, value, type) => {
    const setState = type === 'Individual' ? setIndividualKYCState : setBusinessKYCState;
    const currentState = type === 'Individual' ? individualKYCState : businessKYCState;
    
    const updated = currentState.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setState(updated);
    setHasUnsavedChanges(true);
  };

  // Handle document requirement changes
  const handleDocumentChange = (id, field, value) => {
    const updated = businessDocState.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setBusinessDocState(updated);
    setHasUnsavedChanges(true);
  };

  // Save KYC requirements
  const saveKYCRequirements = async (type) => {
    const requirements = type === 'Individual' ? individualKYCState : businessKYCState;
    try {
      await updateKYCRequirements.mutateAsync(requirements);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save KYC requirements:', error);
      alert('Failed to save KYC requirements. Please try again.');
    }
  };

  // Save document requirements
  const saveDocumentRequirements = async () => {
    try {
      await updateDocumentRequirements.mutateAsync(businessDocState);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save document requirements:', error);
      alert('Failed to save document requirements. Please try again.');
    }
  };

  // Reset changes
  const resetChanges = () => {
    setIndividualKYCState([...individualKYC]);
    setBusinessKYCState([...businessKYC]);
    setBusinessDocState([...businessDocuments]);
    setHasUnsavedChanges(false);
  };

  // Field key display mapping
  const getFieldDisplayName = (fieldKey) => {
    const mapping = {
      'bvn': 'Bank Verification Number (BVN)',
      'nin': 'National Identification Number (NIN)',
      'cac': 'Certificate of Incorporation (CAC)',
      'utility_bill': 'Utility Bill',
      'mermat': 'Memorandum of Association',
      'other': 'Other Documents'
    };
    return mapping[fieldKey] || fieldKey.toUpperCase();
  };

  // Requirements table component
  const RequirementsTable = ({ 
    data, 
    loading, 
    type, 
    onChange, 
    onSave, 
    title 
  }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onSave}
            disabled={updateKYCRequirements.isLoading || updateDocumentRequirements.isLoading}
            className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {(updateKYCRequirements.isLoading || updateDocumentRequirements.isLoading) 
              ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field/Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enabled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandatory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getFieldDisplayName(item.fieldKey || item.documentKey)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Key: {item.fieldKey || item.documentKey}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => onChange(
                          item.id, 
                          'enabled', 
                          e.target.checked, 
                          type
                        )}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.mandatory}
                        onChange={(e) => onChange(
                          item.id, 
                          'mandatory', 
                          e.target.checked, 
                          type
                        )}
                        disabled={!item.enabled}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {item.mandatory ? 'Required' : 'Optional'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updatedAt).toLocaleString()}
                    {item.updatedByAdminId && (
                      <div className="text-xs">By Admin {item.updatedByAdminId}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Requirements</h1>
          <p className="text-gray-600 mt-2">Configure KYC and document requirements for customer onboarding</p>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Unsaved Changes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You have unsaved changes. Make sure to save your changes before leaving.</p>
                  <button
                    onClick={resetChanges}
                    className="mt-1 text-yellow-800 underline hover:text-yellow-900"
                  >
                    Reset all changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'individual'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Customers
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Customers
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'individual' && (
            <RequirementsTable
              data={individualKYCState}
              loading={individualKYCLoading}
              type="Individual"
              onChange={handleKYCChange}
              onSave={() => saveKYCRequirements('Individual')}
              title="Individual KYC Requirements"
            />
          )}

          {activeTab === 'business' && (
            <>
              <RequirementsTable
                data={businessKYCState}
                loading={businessKYCLoading}
                type="Business"
                onChange={handleKYCChange}
                onSave={() => saveKYCRequirements('Business')}
                title="Business KYC Requirements"
              />

              <RequirementsTable
                data={businessDocState}
                loading={businessDocLoading}
                type="Business"
                onChange={(id, field, value) => handleDocumentChange(id, field, value)}
                onSave={saveDocumentRequirements}
                title="Business Document Requirements"
              />
            </>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Configuration Guide</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Enabled:</strong> When checked, this field/document will be available during customer onboarding.</p>
            <p><strong>Mandatory:</strong> When checked, customers must provide this information to complete onboarding. Can only be set if the field is enabled.</p>
            <p><strong>Individual vs Business:</strong> Different customer types have different requirements. Individual customers only need KYC verification, while business customers need both KYC and document uploads.</p>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">KYC Fields</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>BVN:</strong> Bank Verification Number for identity verification</li>
                <li>• <strong>NIN:</strong> National Identification Number for government ID verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Business Documents</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>CAC:</strong> Certificate of Incorporation</li>
                <li>• <strong>Utility Bill:</strong> Proof of business address</li>
                <li>• <strong>Memorandum:</strong> Memorandum of Association</li>
                <li>• <strong>Other:</strong> Additional supporting documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;