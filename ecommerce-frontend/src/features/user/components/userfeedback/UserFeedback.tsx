import styles from "./UserFeedback.module.css";

interface Props {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose?: () => void;
}

export default function UserFeedback({ type, message, onClose }: Props) {
  return (
    <div className={`${styles.feedback} ${styles[type]}`}>
      <div className={styles.text}>{message}</div>
      {onClose && (
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
}