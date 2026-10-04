import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  managerOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  managerOnly = false,
}) => {
  const { user, isManager, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFF9F0]">
        <div className="w-12 h-12 border-4 border-[#0F5C5C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-lg font-bold text-[#0F5C5C]">Opening health notebook...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
