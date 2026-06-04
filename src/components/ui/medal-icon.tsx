import { Trophy } from 'lucide-react-native';

const MEDAL_COLORS = ['#FFD700', '#9E9E9E', '#CD7F32'];

type Props = { position: number; size?: number };

export function MedalIcon({ position, size = 18 }: Props) {
  if (position < 1 || position > 3) return null;
  return <Trophy size={size} color={MEDAL_COLORS[position - 1]} />;
}
