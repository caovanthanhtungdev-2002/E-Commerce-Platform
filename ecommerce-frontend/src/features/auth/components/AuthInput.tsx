
type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export default function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
}: Props) {
  return (
    <div>
      <label style={{ fontSize: 12, opacity: 0.6 }}>{label}</label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: 4,
          background: 'rgba(255,255,255,0.05)',
          border: error ? '1px solid red' : '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
        }}
      />

      {error && <p style={{ color: 'red', fontSize: 12 }}>{error}</p>}
    </div>
  );
}