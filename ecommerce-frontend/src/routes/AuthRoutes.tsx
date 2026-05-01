import { Route } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/forgotpassword/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/resetpassword/ResetPasswordPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RegisterPage from '@/features/auth/pages/register/RegisterPage';
import ProfilePage from '@/features/user/pages/ProfilePage';
import ChangePasswordPage from '@/features/user/pages/ChangePasswordPage';
 


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
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
    </>
  );
}