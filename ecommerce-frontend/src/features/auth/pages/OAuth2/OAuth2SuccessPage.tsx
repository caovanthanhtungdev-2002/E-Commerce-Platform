import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import axiosInstance from '@/config/axios';

export default function OAuth2SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuthStore();
  const called = useRef(false); // tránh StrictMode gọi 2 lần

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Gắn token vào header rồi fetch thông tin user
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axiosInstance
      .get('/api/user/profile', {
  headers: { Authorization: `Bearer ${token}` }
})
      .then((res) => {
        const user = res.data?.data ?? res.data;
        setTokens(token, user);
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 16,
        fontFamily: 'sans-serif',
        color: '#555',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid #ee4d2d',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0 }}>Đang đăng nhập, vui lòng chờ...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
