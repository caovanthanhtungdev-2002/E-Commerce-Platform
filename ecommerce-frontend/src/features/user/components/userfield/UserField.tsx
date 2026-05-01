import styles from "./UserField.module.css";
import { useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}

export default function UserField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: Props) {
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={`${styles.field} ${focus && styles.focused} ${
        error && styles.fieldError
      }`}
    >
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          className={`${styles.input} ${error && styles.hasError}`}
          value={value}
          type={type}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}