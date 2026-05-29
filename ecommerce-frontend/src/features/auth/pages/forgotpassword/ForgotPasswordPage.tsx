import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from '../AuthPage.module.css';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Vui lòng nhập email'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email không hợp lệ'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email });
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.headerLogo}>
          <div className={styles.logoMark}>T</div>
          <span className={styles.logoText}>TGBNY</span>
        </Link>
        <a href="#" className={styles.headerHelp}>Bạn cần giúp đỡ?</a>
      </header>

      <main className={styles.body}>
        <div className={styles.inner} style={{ justifyContent: 'center' }}>
          <div className={styles.card} style={{ width: 440 }}>
            {/* Back link */}
            <div>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#999', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>

            {/* Icon */}
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f3', border: '1px solid #ffcbb8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 className={styles.cardTitle} style={{ margin: 0 }}>Quên mật khẩu?</h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 8, lineHeight: 1.6 }}>
                Nhập email của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
              </p>
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
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${error ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button className={styles.btn} type="submit" disabled={loading}>
                  {loading ? <><span className={styles.spinner}></span>Đang gửi...</> : 'GỬI MÃ OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        © 2025 Shopee. Kết nối nhanh hơn, mua sắm dễ dàng hơn.
      </footer>
    </div>
  );
}
