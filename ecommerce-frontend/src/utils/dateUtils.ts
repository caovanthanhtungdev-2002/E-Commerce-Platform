// Chuyển array [yyyy, MM, dd, HH, mm, ss] từ Java LocalDateTime
const fromJavaArray = (dt: any): Date | null => {
  if (!Array.isArray(dt)) return null;
  const [year, month, day, hour = 0, minute = 0, second = 0] = dt;
  return new Date(year, month - 1, day, hour, minute, second); // month -1 vì JS 0-indexed
};

export const formatDate = (dt: string | Date | number | any[] | undefined | null): string => {
  if (dt == null) return '—';
  const d = Array.isArray(dt) ? fromJavaArray(dt) : new Date(dt as any);
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

export const formatDateTime = (dt: string | Date | number | any[] | undefined | null): string => {
  if (dt == null) return '—';
  const d = Array.isArray(dt) ? fromJavaArray(dt) : new Date(dt as any);
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN');
};