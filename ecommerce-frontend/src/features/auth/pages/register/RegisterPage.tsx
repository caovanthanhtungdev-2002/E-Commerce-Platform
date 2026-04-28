import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

 const [form, setForm] = useState({
  username: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
});

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    //validate frontend
    if (form.password !== form.confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    try {
      await register(form);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {}
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>

        {error && <p className={styles.error}>{error}</p>}

        <input
          className={styles.input}
          placeholder="Full Name"
          onChange={(e) => handleChange('fullName', e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Email"
          onChange={(e) => handleChange('email', e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => handleChange('password', e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
        />
        <input
  className={styles.input}
  placeholder="Username"
  onChange={(e) => handleChange('username', e.target.value)}
/>

<input
  className={styles.input}
  placeholder="Phone"
  onChange={(e) => handleChange('phone', e.target.value)}
/>

        <button className={styles.button} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Register'}
        </button>

        <p className={styles.footer}>
          Đã có tài khoản?{' '}
          <Link to="/login" className={styles.link}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}