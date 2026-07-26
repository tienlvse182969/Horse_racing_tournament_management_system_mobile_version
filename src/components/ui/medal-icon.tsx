import { View } from 'react-native';
import { Trophy } from 'lucide-react-native';

import { useAppColors } from '@/hooks/use-theme';

type Props = { position: number; size?: number };

const GOLD = '#FFD700';
const BRONZE = '#CD7F32';

// Oversized, faded copies of the same glyph stacked behind it — the halo traces
// the trophy's actual outline (cup, handles, stem) instead of sitting behind it
// as a generic circular blob.
const GLOW_LAYERS = [
  { scale: 1.35, opacity: 0.05 },
  { scale: 1.25, opacity: 0.09 },
  { scale: 1.15, opacity: 0.14 },
  { scale: 1.07, opacity: 0.22 },
];

export function MedalIcon({ position, size = 18 }: Props) {
  const { C } = useAppColors();
  if (position < 1 || position > 3) return null;
  if (position === 2) return <Trophy size={size} color={C.onSurfaceVariant} />;
  if (position === 3) return <Trophy size={size} color={BRONZE} />;

  // Gold medal gets a soft glow along its own linework so it reads as brighter than silver/bronze.
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {GLOW_LAYERS.map(({ scale, opacity }, i) => (
        <View key={i} style={{ position: 'absolute', opacity }}>
          <Trophy size={size * scale} color={GOLD} />
        </View>
      ))}
      <Trophy size={size} color={GOLD} />
    </View>
  );
}
