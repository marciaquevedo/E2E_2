import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '../api/types';

export function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role?: Role;
}) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
  }
  return <>{children}</>;
}
