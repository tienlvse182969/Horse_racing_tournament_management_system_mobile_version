export function formatNumber(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return sign + Math.abs(Math.trunc(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}tỷ`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return `${amount}`;
}

export function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

export function isBeforeBanEnd(date: string, time: string, bannedUntil?: string | null): boolean {
  if (!bannedUntil) return false;
  return new Date(`${date}T${time}:00`) < new Date(bannedUntil);
}
