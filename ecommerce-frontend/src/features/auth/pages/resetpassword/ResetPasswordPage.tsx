import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from '../AuthPage.module.css';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = (location.state as any)?.email || '';

  const [form, setForm] = useState({
    email: prefillEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const { forgotPassword } = useAuthStore();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };

  const resendOtp = async () => {
    if (otpCountdown > 0 || !form.email) return;
    try {
      await forgotPassword({ email: form.email });
      setOtpCountdown(60);
      const interval = setInterval(() => {
        setOtpCountdown(v => { if (v <= 1) { clearInterval(interval); return 0; } return v - 1; });
      }, 1000);
    } catch {}
  };

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    if (!form.otp.trim()) errs.otp = 'Vui lòng nhập mã OTP';
    if (!form.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (form.newPassword.length < 8) errs.newPassword = 'Mật khẩu ít nhất 8 ký tự';
    if (!form.confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGlobalError('');
    try {
      await resetPassword(form);
      navigate('/login');
    } catch (err: any) {
      setGlobalError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.headerLogo}>
          <div className={styles.logoMark}>S</div>
          <span className={styles.logoText}>TGBNY</span>
        </Link>
        <a href="#" className={styles.headerHelp}>Bạn cần giúp đỡ?</a>
      </header>

      <main className={styles.body}>
        <div className={styles.inner} style={{ justifyContent: 'center' }}>
          <div className={styles.card} style={{ width: 440 }}>
            <div>
              <Link to="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#999', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Quay lại
              </Link>
            </div>

            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f3', border: '1px solid #ffcbb8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h1 className={styles.cardTitle} style={{ margin: 0 }}>Đặt lại mật khẩu</h1>
              {prefillEmail && (
                <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                  Mã OTP đã gửi đến <strong style={{ color: '#555' }}>{prefillEmail}</strong>
                </p>
              )}
            </div>

            {globalError && (
              <div className={styles.globalError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {globalError}
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
                    <input className={styles.input} type="email" placeholder="Email" value={form.email} onChange={set('email')} />
                  </div>
                  {fieldErrors.email && <p className={styles.errorMsg}>{fieldErrors.email}</p>}
                </div>

                {/* OTP */}
                <div className={styles.field}>
                  <div className={styles.otpGroup}>
                    <div className={`${styles.inputWrap} ${fieldErrors.otp ? styles.hasError : ''}`} style={{ flex: 1 }}>
                      <span className={styles.inputIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </span>
                      <input className={styles.input} placeholder="Mã OTP" value={form.otp} onChange={set('otp')} maxLength={6} />
                    </div>
                    <button type="button" className={styles.otpBtn} disabled={otpCountdown > 0} onClick={resendOtp}>
                      {otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : 'Gửi lại'}
                    </button>
                  </div>
                  {fieldErrors.otp && <p className={styles.errorMsg}>{fieldErrors.otp}</p>}
                </div>

                {/* New Password */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.newPassword ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input className={styles.input} type={showNew ? 'text' : 'password'} placeholder="Mật khẩu mới" value={form.newPassword} onChange={set('newPassword')} />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowNew(v => !v)} aria-label="Toggle">
                      <EyeIcon show={showNew} />
                    </button>
                  </div>
                  {fieldErrors.newPassword && <p className={styles.errorMsg}>{fieldErrors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.confirmPassword ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input className={styles.input} type={showConfirm ? 'text' : 'password'} placeholder="Xác nhận mật khẩu mới" value={form.confirmPassword} onChange={set('confirmPassword')} />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowConfirm(v => !v)} aria-label="Toggle">
                      <EyeIcon show={showConfirm} />
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className={styles.errorMsg}>{fieldErrors.confirmPassword}</p>}
                </div>

                <button className={styles.btn} type="submit" disabled={loading}>
                  {loading ? <><span className={styles.spinner}></span>Đang xử lý...</> : 'ĐẶT LẠI MẬT KHẨU'}
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
