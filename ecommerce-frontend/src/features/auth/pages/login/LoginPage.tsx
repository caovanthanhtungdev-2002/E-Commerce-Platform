import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from '../AuthPage.module.css';

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email, password });
      const { accessToken } = useAuthStore.getState();
      if (accessToken) navigate(next, { replace: true });
    } catch {
      // error set in store
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.headerLogo}>
          <div className={styles.logoMark}>T</div>
          <span className={styles.logoText}>TGBNY</span>
        </Link>
        <a href="#" className={styles.headerHelp}>Bạn cần giúp đỡ?</a>
      </header>

      {/* Body */}
      <main className={styles.body}>
        <div className={styles.inner}>
          {/* Illustration */}
          <div className={styles.illustration}>
            <div className={styles.illustrationTitle}>
              Mua sắm tại TGBNY<br />siêu nhanh, siêu rẻ
            </div>
            <p className={styles.illustrationSub}>
              Hàng triệu sản phẩm chính hãng với giá tốt nhất.<br />
              Giao hàng nhanh toàn quốc.
            </p>
            <div className={styles.illustrationImg}>
              <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="260" height="200">
                {/* Bag */}
                <rect x="80" y="80" width="100" height="80" rx="10" fill="white" fillOpacity="0.9"/>
                <rect x="100" y="65" width="60" height="30" rx="15" fill="none" stroke="white" strokeWidth="8" strokeOpacity="0.9"/>
                {/* Tag */}
                <rect x="100" y="95" width="60" height="26" rx="4" fill="#ee4d2d"/>
                <text x="130" y="113" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="sans-serif">SALE</text>
                {/* Stars */}
                {[30, 210, 50].map((cx, i) => (
                  <circle key={i} cx={cx} cy={[40, 60, 150][i]} r="5" fill="white" fillOpacity="0.6"/>
                ))}
                <circle cx="200" cy="140" r="3" fill="white" fillOpacity="0.4"/>
                <circle cx="40" cy="120" r="3" fill="white" fillOpacity="0.4"/>
                {/* Package */}
                <rect x="155" y="120" width="60" height="44" rx="6" fill="white" fillOpacity="0.7"/>
                <line x1="155" y1="138" x2="215" y2="138" stroke="#ee4d2d" strokeWidth="2"/>
                <line x1="185" y1="120" x2="185" y2="164" stroke="#ee4d2d" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.cardTitle}>Đăng nhập</h1>
              <Link to="/register" className={styles.cardSwitch}>Đăng ký</Link>
            </div>

            {error && (
              <div className={styles.globalError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldGroup}>
                {/* Email */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.email ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && <p className={styles.errorMsg}>{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.password ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      className={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                      autoComplete="current-password"
                    />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && <p className={styles.errorMsg}>{fieldErrors.password}</p>}
                </div>

                <div className={styles.forgotLink}>
                  <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <button className={styles.btn} type="submit" disabled={isLoading}>
                  {isLoading ? <><span className={styles.spinner}></span>Đang đăng nhập...</> : 'ĐĂNG NHẬP'}
                </button>

                <div className={styles.divider}>
                  <span className={styles.dividerLine}/>
                  <span className={styles.dividerText}>Hoặc đăng nhập bằng</span>
                  <span className={styles.dividerLine}/>
                </div>

                <div className={styles.socialRow}>
                  <button type="button" className={styles.socialBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className={styles.socialBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            </form>

            <p className={styles.cardFooter}>
              Bạn chưa có tài khoản?{' '}
              <Link to="/register">Đăng ký</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        © 2025 TGBNY. Kết nối nhanh hơn, mua sắm dễ dàng hơn.
      </footer>
    </div>
  );
}
