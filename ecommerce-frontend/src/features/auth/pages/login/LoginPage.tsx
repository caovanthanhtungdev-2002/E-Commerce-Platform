import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Link } from 'react-router-dom';

import styles from './LoginPage.module.css';


export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handle = async (e: any) => {
  e.preventDefault();

  try {
    await login({ email, password });

    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      navigate('/');
    }
  } catch (err) {
  }
};

 return (
  <div className={styles.container}>
    <form onSubmit={handle} className={styles.card}>
      <h2 className={styles.title}>Welcome Back</h2>

      {error && <p className={styles.error}>{error}</p>}

      <input
        className={styles.input}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className={styles.button} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>

      <Link to="/forgot-password" className={styles.link}>
  Forgot password?
</Link>

      <p className={styles.footer}>
        Chưa có tài khoản?{' '}
        <Link to="/register" className={styles.linkStrong}>
  Đăng ký
</Link>
      </p>
    </form>
  </div>
);
}