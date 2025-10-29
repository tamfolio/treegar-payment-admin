import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout, getCurrentUser } from '../hooks/authhooks';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const user = getCurrentUser();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          navigate('/login', { replace: true });
        },
        onError: (error) => {
          console.error('Logout error:', error);
          navigate('/login', { replace: true });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  logoutMutation.isPending
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {logoutMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </div>
                ) : (
                  'Logout'
                )}
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