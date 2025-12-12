import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout, getCurrentUser } from '../hooks/authhooks';
import LogoutModal from './LogoutModal';
import Sidebar from './Sidebar';
import treegarLogo from '/Images/treegarlogo.svg';

const Layout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const user = getCurrentUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
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

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-3 flex items-center">
                <img
                  src={treegarLogo}
                  alt="Treegar Logo"
                  className="h-8 w-auto mr-2"
                />
                <span className="text-lg font-semibold text-gray-900">Treegar X</span>
              </div>
            </div>

            {/* Mobile User Menu */}
            <div className="flex items-center space-x-2">
              {user && (
                <div className="hidden sm:flex items-center mr-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 truncate max-w-24">
                    {user.firstName}
                  </span>
                </div>
              )}
              
              <button 
                onClick={handleLogoutClick}
                className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  {title || `Welcome back${user ? `, ${user.firstName}` : ''}!`}
                </h2>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {subtitle || 'Manage your accounts and transactions'}
                </p>
              </div>
              
              {/* Desktop User Menu */}
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-3 hidden xl:block">
                      <p className="text-sm font-medium text-gray-700">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-40">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleLogoutClick}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-full overflow-hidden">
          {/* Mobile Page Header (if title provided) */}
          {(title || subtitle) && (
            <div className="lg:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {title || `Welcome back${user ? `, ${user.firstName}` : ''}!`}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;