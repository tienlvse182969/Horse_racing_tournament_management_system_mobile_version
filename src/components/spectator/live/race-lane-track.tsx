import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Rect, G, Circle, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useEffect } from 'react';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { Spacing, Shape } from '@/constants/theme';
import type { RaceEntry } from '@/mock-data';

// ─── Track geometry ────────────────────────────────────────────────────────────
const VB_W = 340;
const VB_H = 200;
const CX = 170;
const CY = 100;
const OUTER_RX = 155;
const OUTER_RY = 78;
const INNER_RX = 116;
const INNER_RY = 53;

// 10 evenly-spaced lanes between inner and outer track walls
const LANE_RX = [119, 122, 125, 128, 131, 134, 137, 140, 143, 147];
const LANE_RY = [56,  57,  59,  60,  62,  63,  65,  66,  68,  70 ];

// Finish/start line: vertical stripe at θ = -π/2 (top of oval)
const FINISH_X = CX;
const FINISH_Y_TOP = CY - OUTER_RY;
const FINISH_Y_BOT = CY - INNER_RY;

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  entries: RaceEntry[];
  progressSvs: SharedValue<number>[];
  laps: number;
  highlightIndex?: number;
};

// ─── Main component ────────────────────────────────────────────────────────────
export function RaceLaneTrack({ entries, progressSvs, laps, highlightIndex }: Props) {
  return (
    <View style={styles.wrapper}>
      <Svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={styles.svg}>

        <Defs>
          <LinearGradient id="trackGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A1A08" />
            <Stop offset="1" stopColor="#1A1005" />
          </LinearGradient>
        </Defs>

        {/* Outer track fill */}
        <Ellipse cx={CX} cy={CY} rx={OUTER_RX} ry={OUTER_RY} fill="url(#trackGrad)" />

        {/* Inner grass */}
        <Ellipse cx={CX} cy={CY} rx={INNER_RX} ry={INNER_RY} fill="#0A1F0A" />

        {/* Inner grass detail line */}
        <Ellipse cx={CX} cy={CY} rx={INNER_RX - 4} ry={INNER_RY - 4}
          fill="none" stroke="#0D2A0D" strokeWidth={2} />

        {/* Outer track border */}
        <Ellipse cx={CX} cy={CY} rx={OUTER_RX} ry={OUTER_RY}
          fill="none" stroke="#3D2610" strokeWidth={2} />

        {/* Lane divider lines (subtle) */}
        {[INNER_RX + 8, INNER_RX + 18].map((rx, i) => (
          <Ellipse
            key={i}
            cx={CX} cy={CY}
            rx={rx}
            ry={Math.round(rx * (OUTER_RY / OUTER_RX))}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            strokeDasharray="8 6"
          />
        ))}

        {/* Finish/start line */}
        <Rect
          x={FINISH_X - 1.5}
          y={FINISH_Y_TOP}
          width={3}
          height={FINISH_Y_BOT - FINISH_Y_TOP}
          fill="white"
          opacity={0.85}
        />
        {/* Checkered pattern on finish line */}
        {[0, 2, 4].map(i => (
          <Rect
            key={i}
            x={FINISH_X - 1.5}
            y={FINISH_Y_TOP + i * ((FINISH_Y_BOT - FINISH_Y_TOP) / 6)}
            width={1.5}
            height={(FINISH_Y_BOT - FINISH_Y_TOP) / 6}
            fill="#111"
            opacity={0.6}
          />
        ))}

        {/* Horse markers — rendered last so they appear on top */}
        {entries.map((entry, i) => (
          <HorseMarker
            key={entry.horse.id}
            progressSv={progressSvs[i]}
            laps={laps}
            lane={i % LANE_RX.length}
            color={entry.horse.color}
            number={entry.horse.number}
            isHighlighted={i === highlightIndex}
          />
        ))}
      </Svg>
    </View>
  );
}

// ─── Individual horse marker ───────────────────────────────────────────────────
type HorseMarkerProps = {
  progressSv: SharedValue<number>;
  laps: number;
  lane: number;
  color: string;
  number: number;
  isHighlighted?: boolean;
};

function HorseMarker({ progressSv, laps, lane, color, number, isHighlighted }: HorseMarkerProps) {
  const rx = LANE_RX[lane] ?? LANE_RX[0];
  const ry = LANE_RY[lane] ?? LANE_RY[0];

  const pulseOpacity = useSharedValue(isHighlighted ? 1 : 0);
  useEffect(() => {
    if (isHighlighted) {
      pulseOpacity.value = withRepeat(withTiming(0, { duration: 800 }), -1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighlighted]);

  // Position on ellipse: θ starts at top (-π/2), goes clockwise
  const animatedProps = useAnimatedProps(() => {
    const progress = Math.min(progressSv.value, laps);
    const theta = (progress % 1) * 2 * Math.PI - Math.PI / 2;
    const x = CX + rx * Math.cos(theta);
    const y = CY + ry * Math.sin(theta);
    return {
      transform: [{ translateX: x - CX }, { translateY: y - CY }],
    };
  });

  const pulseProps = useAnimatedProps(() => ({ opacity: pulseOpacity.value }));

  const dotR = isHighlighted ? 14 : 10;
  const shadowR = isHighlighted ? 15 : 11;

  return (
    <AnimatedG animatedProps={animatedProps}>
      {/* Pulsing ring for highlighted (jockey's own horse) */}
      {isHighlighted && (
        <AnimatedCircle cx={CX} cy={CY} r={20} fill="none" stroke={color} strokeWidth={2} animatedProps={pulseProps} />
      )}
      {/* Shadow circle */}
      <Circle cx={CX} cy={CY + 1} r={shadowR} fill="rgba(0,0,0,0.4)" />
      {/* Horse dot */}
      <Circle cx={CX} cy={CY} r={dotR} fill={color} />
      {/* Horse number */}
      <SvgText
        x={CX}
        y={CY + 3.5}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={isHighlighted ? 10 : 9}
        fontWeight="bold">
        {number}
      </SvgText>
    </AnimatedG>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    borderRadius: Shape.large,
    overflow: 'hidden',
    backgroundColor: '#0A0602',
  },
  svg: {
    aspectRatio: VB_W / VB_H,
  },
});
