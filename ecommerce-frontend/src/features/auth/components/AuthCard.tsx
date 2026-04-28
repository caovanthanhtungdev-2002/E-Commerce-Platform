import styles from '../pages/login/LoginPage.module.css';

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.backdrop}></div>
      <div className={styles.card}>{children}</div>
    </div>
  );
}