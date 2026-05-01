import styles from "./UserAvatar.module.css";
import { useRef, useState } from "react";

interface Props {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  loading?: boolean;
  onUpload?: (file: File) => void;
}

export default function UserAvatar({
  src,
  name,
  size = "lg",
  editable,
  loading,
  onUpload,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${styles.wrapper} ${styles[size]}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.ring}>
        <div className={styles.avatar}>
          {src ? (
            <img src={src} className={styles.image} />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
      </div>

      {editable && (
        <>
          <button
            className={`${styles.editBtn} ${hover && styles.editBtnVisible}`}
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            {loading ? <div className={styles.spinner} /> : "✎"}
          </button>

          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUpload?.(e.target.files[0]);
              }
            }}
          />
        </>
      )}
    </div>
  );
}