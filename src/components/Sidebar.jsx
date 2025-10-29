import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../hooks/authhooks';
import treegarLogo from '/Images/treegarlogo.svg';

const Sidebar = () => {
  const location = useLocation();
  const user = getCurrentUser();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-full fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        {/* Logo */}
        <div className="flex items-center mb-4">
          <img
            src={treegarLogo}
            alt="Treegar Logo"
            className="h-10 w-auto mr-3"
          />
        </div>
        
        {/* User Info */}
        {user && (
          <div className="text-sm">
            <p className="text-gray-300">Welcome back,</p>
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        )}
      </div>
      
      <nav className="mt-8">
        <div className="px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;