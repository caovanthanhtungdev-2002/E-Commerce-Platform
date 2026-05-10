import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    
    return <Navigate to={`/login?next=${location.pathname}${location.search}`} replace />;
  }

  return <>{children}</>;
}
