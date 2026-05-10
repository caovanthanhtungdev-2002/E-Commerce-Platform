import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function AdminGuard() {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login?next=/admin" replace />;
  }

 if (user.role !== "ADMIN" && user.role !== "ROOT") {
  return <Navigate to="/" replace />;
}

  return <Outlet />;
}
