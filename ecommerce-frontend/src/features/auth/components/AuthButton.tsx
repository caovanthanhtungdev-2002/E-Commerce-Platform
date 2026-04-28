type Props = {
  text: string;
  loading?: boolean;
};

export default function AuthButton({ text, loading }: Props) {
  return (
    <button
      disabled={loading}
      style={{
        marginTop: 10,
        padding: 12,
        width: '100%',
        background: '#b48c50',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {loading ? 'Loading...' : text}
    </button>
  );
}