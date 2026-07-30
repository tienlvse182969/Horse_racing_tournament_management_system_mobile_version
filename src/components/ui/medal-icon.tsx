import { View } from 'react-native';
import { Trophy } from 'lucide-react-native';

type Props = { position: number; size?: number };

const GOLD = '#FFD700';
const GOLD_STROKE = '#B8860B';
const SILVER = '#E0E0E0';
const SILVER_STROKE = '#6E7275';
const BRONZE = '#CD7F32';
const BRONZE_STROKE = '#8B4513';

// Oversized, faded copies of the same glyph stacked behind it — the halo traces
// the trophy's actual outline (cup, handles, stem) instead of sitting behind it
// as a generic circular blob.
const GLOW_LAYERS = [
  { scale: 1.35, opacity: 0.05 },
  { scale: 1.25, opacity: 0.09 },
  { scale: 1.15, opacity: 0.14 },
  { scale: 1.07, opacity: 0.22 },
];

// Thicker stroke so the base and stem — plain line paths in the source icon,
// with no closed area for `fill` to apply to — read as solid instead of hollow.
const BASE_STROKE_WIDTH = 3;

export function MedalIcon({ position, size = 18 }: Props) {
  if (position < 1 || position > 3) return null;
  if (position === 2) return <Trophy size={size} color={SILVER_STROKE} fill={SILVER} strokeWidth={BASE_STROKE_WIDTH} />;
  if (position === 3) return <Trophy size={size} color={BRONZE_STROKE} fill={BRONZE} strokeWidth={BASE_STROKE_WIDTH} />;

  // Gold medal gets a soft glow along its own linework so it reads as brighter than silver/bronze.
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {GLOW_LAYERS.map(({ scale, opacity }, i) => (
        <View key={i} style={{ position: 'absolute', opacity }}>
          <Trophy size={size * scale} color={GOLD} strokeWidth={BASE_STROKE_WIDTH} />
        </View>
      ))}
      <Trophy size={size} color={GOLD_STROKE} fill={GOLD} strokeWidth={BASE_STROKE_WIDTH} />
    </View>
  );
}
