import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

  return (
    <div className={`${styles.toast} ${styles[type]} ${!visible ? styles.hide : ""}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}

// Toast Manager
interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;
let addToastFn: ((msg: string, type?: "success" | "error" | "info") => void) | null = null;

export function useToast() {
  return {
    showToast: (msg: string, type: "success" | "error" | "info" = "success") => {
      if (addToastFn) addToastFn(msg, type);
    }
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastFn = (msg, type = "success") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message: msg, type }]);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
        />
      ))}
    </div>
  );
}
