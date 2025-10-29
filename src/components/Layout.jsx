import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout, getCurrentUser } from '../hooks/authhooks';
import LogoutModal from './LogoutModal';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const user = getCurrentUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
      },
      onError: (error) => {
        console.error('Logout error:', error);
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
      }
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={logoutMutation.isPending}
      />

      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {title || `Welcome back${user ? `, ${user.firstName}` : ''}!`}
              </h2>
              <p className="text-sm text-gray-600">
                {subtitle || 'Manage your accounts and transactions'}
              </p>
            </div>
            
            {/* Logout Button */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLogoutClick}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;