export default function AuthError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      style={{
        background: 'rgba(255,0,0,0.1)',
        padding: 10,
        marginBottom: 10,
        color: '#ff6b6b',
      }}
    >
      {message}
    </div>
  );
}