import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { createPageUrl } from '@/utils';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#7cb342', borderTopColor: 'transparent' }}></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // For protected routes, show the login modal instead of redirecting
    // This maintains the current page context
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="neumorphic p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-primary mb-4">Authentication Required</h2>
            <p className="text-secondary mb-6">Please sign in to access this page.</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
              className="neumorphic-button px-6 py-3 font-semibold text-white rounded-xl"
              style={{ backgroundColor: '#7cb342' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}