import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ProtectedRoute({ children }: any) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return children;
}