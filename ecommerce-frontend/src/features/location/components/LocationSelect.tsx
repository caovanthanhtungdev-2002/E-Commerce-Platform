
import { useState, useRef, useEffect } from "react";
import styles from "./LocationSelect.module.css";

interface Props {
  placeholder: string;
  value: string;
  options: { code: string; name: string }[];
  onChange: (name: string) => void;
  disabled?: boolean;
}

export default function LocationSelect({ placeholder, value, options, onChange, disabled }: Props) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className={`${styles.wrap} ${disabled ? styles.disabled : ""}`}>
      <div
        className={`${styles.trigger} ${open ? styles.open : ""}`}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </span>
        <svg className={`${styles.arrow} ${open ? styles.arrowUp : ""}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="#aaa" fill="none" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 ? (
              <li className={styles.empty}>Không tìm thấy</li>
            ) : (
              filtered.map(o => (
                <li
                  key={o.code}
                  className={`${styles.item} ${o.name === value ? styles.selected : ""}`}
                  onClick={() => handleSelect(o.name)}
                >
                  {o.name}
                  {o.name === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}