import { Route } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/forgotpassword/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/resetpassword/ResetPasswordPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RegisterPage from '@/features/auth/pages/register/RegisterPage';
import ProfilePage from '@/features/user/pages/profile/ProfilePage';
import ChangePasswordPage from '@/features/user/pages/changpassword/ChangePasswordPage';
import CategoryPage from "@/features/category/pages/CategoryPage";
import ProductPage from "@/features/product/pages/productpage/ProductPage";
import CartPage from "@/features/cart/pages/CartPage";

import CheckoutPage from "@/features/order/pages/checkout/CheckoutPage";
import OrderDetailPage from "@/features/order/pages/detail/OrderDetailPage";
import OrderHistoryPage from "@/features/order/pages/history/OrderHistoryPage";

import PaymentPage from "@/features/payment/pages/paymentpage/PaymentPage";
import PaymentResultPage from "@/features/payment/pages/paymentresult/PaymentResultPage";

export function AuthRoutes() {
  return (
    <>
      <Route
        path="/"
        element={
          <ProtectedRoute>
           < ProductPage/>
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />

      {/* PAYMENT RESULT */}
      <Route path="/payment-result" element={<PaymentResultPage />} />

      {/* ================= ORDER ================= */}

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* ================= PAYMENT ================= */}

      <Route
        path="/payment/:id"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
    </>
  );
}