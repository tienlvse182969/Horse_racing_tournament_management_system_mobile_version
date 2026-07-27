// Fixed glass-on-photo palette for the auth screen — intentionally independent of the
// app-wide light/dark theme so the frosted card keeps consistent contrast over authen.jpg.
export const AuthColor = {
  primary: '#FFB86C',
  onPrimary: '#462200',
  tertiary: '#72D79A',
  onTertiary: '#003920',
  error: '#FFB4AB',
  text: '#FDF6EC',
  textMuted: 'rgba(253,246,236,0.68)',
  textFaint: 'rgba(253,246,236,0.45)',
  border: 'rgba(253,246,236,0.18)',
  borderStrong: 'rgba(253,246,236,0.32)',
  fieldFill: 'rgba(253,246,236,0.07)',
  chipFill: 'rgba(253,246,236,0.08)',
  cardTint: 'rgba(18,13,7,0.46)',
} as const;

export function withAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`;
}
