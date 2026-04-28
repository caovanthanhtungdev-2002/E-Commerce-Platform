import { Route } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/forgotpassword/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/resetpassword/ResetPasswordPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RegisterPage from '@/features/auth/pages/register/RegisterPage';

export function AuthRoutes() {
  return (
    <>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <h1>Dashboard</h1>
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </>
  );
}