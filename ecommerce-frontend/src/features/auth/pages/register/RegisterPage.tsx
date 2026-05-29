import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from '../AuthPage.module.css';

interface FormState {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors extends Partial<Record<keyof FormState, string>> {}

export default function RegisterPage() {
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 8) errs.password = 'Mật khẩu ít nhất 8 ký tự';
    if (!form.confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form);
      navigate('/login');
    } catch {
      // error set in store
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
              Tham gia Shopee<br />nhận ngay ưu đãi
            </div>
            <p className={styles.illustrationSub}>
              Đăng ký tài khoản và khám phá hàng triệu<br />
              sản phẩm với giá cực tốt mỗi ngày.
            </p>
            <div className={styles.illustrationImg}>
              <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="260" height="200">
                {/* Gift box */}
                <rect x="80" y="95" width="100" height="75" rx="8" fill="white" fillOpacity="0.9"/>
                <rect x="80" y="80" width="100" height="25" rx="4" fill="white" fillOpacity="0.7"/>
                {/* Ribbon horizontal */}
                <rect x="80" y="87" width="100" height="11" fill="#ee4d2d"/>
                {/* Ribbon vertical */}
                <rect x="124" y="80" width="12" height="90" fill="#ee4d2d"/>
                {/* Bow */}
                <ellipse cx="115" cy="80" rx="14" ry="8" fill="#ee4d2d" transform="rotate(-20 115 80)"/>
                <ellipse cx="145" cy="80" rx="14" ry="8" fill="#ee4d2d" transform="rotate(20 145 80)"/>
                <circle cx="130" cy="80" r="7" fill="#ff6633"/>
                {/* Stars */}
                {[40, 210, 220, 50].map((cx, i) => (
                  <circle key={i} cx={cx} cy={[50, 50, 150, 160][i]} r={[5, 4, 3, 6][i]} fill="white" fillOpacity={[0.7, 0.5, 0.4, 0.6][i]}/>
                ))}
                {/* Percent badge */}
                <circle cx="205" cy="95" r="22" fill="white" fillOpacity="0.9"/>
                <text x="205" y="100" textAnchor="middle" fill="#ee4d2d" fontSize="14" fontWeight="700" fontFamily="sans-serif">50%</text>
                <text x="205" y="113" textAnchor="middle" fill="#ee4d2d" fontSize="9" fontFamily="sans-serif">OFF</text>
              </svg>
            </div>
          </div>

          {/* Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.cardTitle}>Đăng ký</h1>
              <Link to="/login" className={styles.cardSwitch}>Đăng nhập</Link>
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

                {/* Full Name + Username */}
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <div className={`${styles.inputWrap} ${fieldErrors.fullName ? styles.hasError : ''}`}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </span>
                      <input className={styles.input} placeholder="Họ và tên" value={form.fullName} onChange={set('fullName')} />
                    </div>
                    {fieldErrors.fullName && <p className={styles.errorMsg}>{fieldErrors.fullName}</p>}
                  </div>

                  <div className={styles.field}>
                    <div className={`${styles.inputWrap} ${fieldErrors.username ? styles.hasError : ''}`}>
                      <span className={styles.inputIcon}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </span>
                      <input className={styles.input} placeholder="Tên đăng nhập" value={form.username} onChange={set('username')} />
                    </div>
                    {fieldErrors.username && <p className={styles.errorMsg}>{fieldErrors.username}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.email ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input className={styles.input} type="email" placeholder="Email" value={form.email} onChange={set('email')} autoComplete="email" />
                  </div>
                  {fieldErrors.email && <p className={styles.errorMsg}>{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.phone ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.03 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                      </svg>
                    </span>
                    <input className={styles.input} type="tel" placeholder="Số điện thoại" value={form.phone} onChange={set('phone')} />
                  </div>
                  {fieldErrors.phone && <p className={styles.errorMsg}>{fieldErrors.phone}</p>}
                </div>

                {/* Password + Confirm */}
                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.password ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input className={styles.input} type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password} onChange={set('password')} autoComplete="new-password" />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {fieldErrors.password && <p className={styles.errorMsg}>{fieldErrors.password}</p>}
                </div>

                <div className={styles.field}>
                  <div className={`${styles.inputWrap} ${fieldErrors.confirmPassword ? styles.hasError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input className={styles.input} type={showConfirm ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password">
                      <EyeIcon show={showConfirm} />
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className={styles.errorMsg}>{fieldErrors.confirmPassword}</p>}
                </div>

                <button className={styles.btn} type="submit" disabled={isLoading}>
                  {isLoading ? <><span className={styles.spinner}></span>Đang đăng ký...</> : 'ĐĂNG KÝ'}
                </button>

                <p className={styles.termsNote}>
                  Bằng cách đăng ký, bạn đã đồng ý với{' '}
                  <a href="#">Điều khoản dịch vụ</a> và{' '}
                  <a href="#">Chính sách bảo mật</a> của Shopee.
                </p>
              </div>
            </form>

            <p className={styles.cardFooter}>
              Bạn đã có tài khoản?{' '}
              <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        © 2025 Shopee. Kết nối nhanh hơn, mua sắm dễ dàng hơn.
      </footer>
    </div>
  );
}
