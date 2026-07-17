import { Trophy } from 'lucide-react-native';

import { useAppColors } from '@/hooks/use-theme';

type Props = { position: number; size?: number };

export function MedalIcon({ position, size = 18 }: Props) {
  const { C } = useAppColors();
  if (position < 1 || position > 3) return null;
  const colors = [C.secondary, C.onSurfaceVariant, '#CD7F32'];
  return <Trophy size={size} color={colors[position - 1]} />;
}
