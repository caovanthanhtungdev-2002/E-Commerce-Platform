import styles from "./UserButton.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function UserButton({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  ...rest
}: Props) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${
        fullWidth && styles.fullWidth
      }`}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}