import { Route } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/forgotpassword/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/resetpassword/ResetPasswordPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RegisterPage from '@/features/auth/pages/register/RegisterPage';
import ProfilePage from '@/features/user/pages/profile/ProfilePage';
import ChangePasswordPage from '@/features/user/pages/changpassword/ChangePasswordPage';
import OAuth2SuccessPage from '@/features/auth/pages/OAuth2/OAuth2SuccessPage';

import { ShipmentListPage } from '@/features/shipping/pages/shipmentlist/ShipmentListPage';
import { ShipmentDetailPage } from '@/features/shipping/pages/shipmentdetail/ShipmentDetailPage';
import { ReturnListPage } from '@/features/shipping/pages/returnlist/ReturnListPage';

// NEW PAGES
import HomePage from '@/pages/HomePage';
import ProductPage from '@/features/product/pages/productpage/ProductPage';
import ProductDetailPage from '@/features/product/pages/productdetail/ProductDetailPage';
import CategoryPage from '@/features/category/pages/CategoryPage';
import CartPage from '@/features/cart/pages/CartPage';
import CheckoutPage from '@/features/order/pages/checkout/CheckoutPage';
import OrderDetailPage from '@/features/order/pages/detail/OrderDetailPage';
import OrderHistoryPage from '@/features/order/pages/history/OrderHistoryPage';
import PaymentPage from '@/features/payment/pages/paymentpage/PaymentPage';
import PaymentResultPage from '@/features/payment/pages/paymentresult/PaymentResultPage';
import MainLayout from '@/components/layout/MainLayout';
import ReviewPage from '@/features/review/pages/ReviewPage';
import { useAuthStore } from '@/features/auth/store/authStore';

//ADMIN
import AdminGuard from '@/features/admin/component/AdminGuard';
import AdminLayout from '@/features/admin/component/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminProductsPage from '@/features/admin/pages/AdminProductsPage';
import AdminCategoriesPage from '@/features/admin/pages/AdminCategoriesPage';
import AdminOrdersPage from '@/features/admin/pages/AdminOrdersPage';
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage';
import AdminCouponsPage from '@/features/admin/pages/AdminCouponsPage';
import AdminInventoryPage from '@/features/admin/pages/AdminInventoryPage';

function WithLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
function ReviewPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const productId = Number(id);

  // validate productId
  if (
    !id ||
    Number.isNaN(productId) ||
    productId <= 0
  ) {
    return (
      <div style={{ padding: 20 }}>
        Product không hợp lệ
      </div>
    );
  }

  return (
    <ReviewPage
      productId={productId}
      isLoggedIn={!!user}
    />
  );
}
export function AuthRoutes() {
  return (
    <>
      {/* HOME */}
      <Route path="/" element={<WithLayout><HomePage /></WithLayout>} />

      {/* AUTH - no layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

      {/* USER */}
      <Route path="/profile" element={<WithLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></WithLayout>} />
      <Route path="/change-password" element={<WithLayout><ProtectedRoute><ChangePasswordPage /></ProtectedRoute></WithLayout>} />

      {/* CATEGORIES */}
      <Route path="/categories" element={<WithLayout><CategoryPage /></WithLayout>} />

      {/* PRODUCTS */}
      <Route path="/products" element={<WithLayout><ProductPage /></WithLayout>} />
      <Route path="/products/:id" element={<WithLayout><ProductDetailPage /></WithLayout>} />

      {/* CART */}
      <Route path="/cart" element={<WithLayout><CartPage /></WithLayout>} />

      {/* ORDERS */}
      <Route path="/checkout" element={<WithLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></WithLayout>} />
      <Route path="/orders/:id" element={<WithLayout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></WithLayout>} />
      <Route path="/orders" element={<WithLayout><ProtectedRoute><OrderHistoryPage /></ProtectedRoute></WithLayout>} />

      {/* PAYMENT */}
      <Route path="/payment/:id" element={<WithLayout><ProtectedRoute><PaymentPage /></ProtectedRoute></WithLayout>} />
      <Route path="/payment-result" element={<WithLayout><PaymentResultPage /></WithLayout>} />

<Route path="/products/:id/reviews" element={<WithLayout><ReviewPageWrapper /></WithLayout>} />

      {/* ADMIN - không dùng MainLayout, có sidebar riêng */}
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="shipments" element={<ShipmentListPage />} />
          <Route path="shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="returns" element={<ReturnListPage />} />
        </Route>
      </Route>
    </>
  );
}
