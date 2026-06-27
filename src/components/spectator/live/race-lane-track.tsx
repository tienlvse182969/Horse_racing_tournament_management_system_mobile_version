import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Rect, G, Circle, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useEffect } from 'react';
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { Spacing, Shape } from '@/constants/theme';
import type { RaceEntry } from '@/types/race';

// ─── Track geometry ────────────────────────────────────────────────────────────
const VB_W = 340;
const VB_H = 200;
const CX = 170;
const CY = 100;
const OUTER_RX = 155;
const OUTER_RY = 78;
const INNER_RX = 116;
const INNER_RY = 53;

const LANE_RX = [119, 122, 125, 128, 131, 134, 137, 140, 143, 147];
const LANE_RY = [56,  57,  59,  60,  62,  63,  65,  66,  68,  70 ];

const FINISH_X = CX;
const FINISH_Y_TOP = CY - OUTER_RY;
const FINISH_Y_BOT = CY - INNER_RY;

const AnimatedG     = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath  = Animated.createAnimatedComponent(Path);

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

        {/* Horses — rendered last so they appear on top */}
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

// Gallop constants — 130 ms per half-beat ≈ 4 full strides/s
const LEG_LEN = 8;
const SWING   = 0.65;
const STRIDE  = 130;

function HorseMarker({ progressSv, laps, lane, color, number, isHighlighted }: HorseMarkerProps) {
  const rx = LANE_RX[lane] ?? LANE_RX[0];
  const ry = LANE_RY[lane] ?? LANE_RY[0];

  // Stagger phase so adjacent horses don't stride in lockstep
  const isEven      = lane % 2 === 0;
  const legCycleSv  = useSharedValue<number>(isEven ? -1 : 1);
  const pulseOpacity = useSharedValue(isHighlighted ? 1 : 0);

  useEffect(() => {
    legCycleSv.value = withRepeat(withTiming(isEven ? 1 : -1, { duration: STRIDE }), -1, true);
    if (isHighlighted) {
      pulseOpacity.value = withRepeat(withTiming(0, { duration: 800 }), -1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighlighted]);

  // ── Position on track + facing direction of travel ────────────────────────
  // Reanimated requires transform to be an array (string crashes with flatMap).
  // To rotate around (CX, CY) instead of SVG origin (0,0) we use the standard
  // translate-to-pivot → rotate → untranslate → move-to-position pattern.
  const animatedProps = useAnimatedProps(() => {
    const progress = Math.min(progressSv.value, laps);
    const theta = (progress % 1) * 2 * Math.PI - Math.PI / 2;
    const x = CX + rx * Math.cos(theta);
    const y = CY + ry * Math.sin(theta);

    // Tangent vector → angle so horse always faces its direction of travel
    const dxdt = -rx * Math.sin(theta);
    const dydt =  ry * Math.cos(theta);
    const angleDeg = Math.atan2(dydt, dxdt) * (180 / Math.PI);

    // Applied right-to-left by RN:
    //  1. Shift horse centre to SVG origin
    //  2. Rotate around origin
    //  3. Shift back to (CX, CY)
    //  4. Move to lane position (x, y)
    return {
      transform: [
        { translateX: x - CX },
        { translateY: y - CY },
        { translateX: CX },
        { translateY: CY },
        { rotate: angleDeg + 'deg' },
        { translateX: -CX },
        { translateY: -CY },
      ],
    };
  });

  // ── 4 legs — diagonal gait: front-right + back-left move together ──────────
  // Hips spread wider than before (chest at +5/+3, rump at -5/-7) for
  // the proportionally long horse legs.
  const legsPathProps = useAnimatedProps(() => {
    const c  = legCycleSv.value;
    const aF =  c * SWING;
    const aB = -c * SWING;

    const frx = CX + 5 + Math.sin(aF) * LEG_LEN;
    const fry = CY + 3 + Math.cos(aF) * LEG_LEN;
    const flx = CX + 3 + Math.sin(aB) * LEG_LEN;
    const fly = CY + 3 + Math.cos(aB) * LEG_LEN;
    const brx = CX - 5 + Math.sin(aB) * LEG_LEN;
    const bry = CY + 3 + Math.cos(aB) * LEG_LEN;
    const blx = CX - 7 + Math.sin(aF) * LEG_LEN;
    const bly = CY + 3 + Math.cos(aF) * LEG_LEN;

    return {
      d: `M${CX + 5} ${CY + 3}L${frx} ${fry}` +
         `M${CX + 3} ${CY + 3}L${flx} ${fly}` +
         `M${CX - 5} ${CY + 3}L${brx} ${bry}` +
         `M${CX - 7} ${CY + 3}L${blx} ${bly}`,
    };
  });

  const pulseProps = useAnimatedProps(() => ({ opacity: pulseOpacity.value }));

  return (
    <AnimatedG animatedProps={animatedProps}>
      {isHighlighted && (
        <AnimatedCircle
          cx={CX} cy={CY} r={24}
          fill="none" stroke={color} strokeWidth={2}
          animatedProps={pulseProps}
        />
      )}

      {/* Shadow */}
      <Ellipse cx={CX - 1} cy={CY + 7} rx={8} ry={1.3} fill="rgba(0,0,0,0.22)" />

      {/* Tail — flows back from rump */}
      <Path
        d={`M${CX - 9} ${CY - 1} Q${CX - 15} ${CY} ${CX - 15} ${CY - 8}`}
        stroke={color} strokeWidth={3} fill="none" strokeLinecap="round"
      />

      {/* Legs behind body */}
      <AnimatedPath
        stroke={color} strokeWidth={2.8} fill="none" strokeLinecap="round"
        animatedProps={legsPathProps}
      />

      {/* Body — elongated horizontal oval */}
      <Ellipse cx={CX - 1} cy={CY} rx={9} ry={3.2} fill={color} />

      {/* Neck — tall arched column rising steeply from chest.
          Wide strokeWidth gives the muscular neck silhouette. */}
      <Path
        d={`M${CX + 6} ${CY + 0.5} Q${CX + 9} ${CY - 5} ${CX + 10} ${CY - 10}`}
        stroke={color} strokeWidth={6} fill="none" strokeLinecap="round"
      />

      {/* Mane along neck crest */}
      <Path
        d={`M${CX + 7} ${CY - 2} Q${CX + 9} ${CY - 7} ${CX + 11} ${CY - 11}`}
        stroke="rgba(0,0,0,0.3)" strokeWidth={2.5} fill="none" strokeLinecap="round"
      />

      {/* Head — long wedge profile (the key horse-vs-cat fix).
          Horizontal span ≈ 10 units, height ≈ 5.5 units → clearly elongated.
          Convex forehead arch is the signature horse silhouette feature. */}
      <Path
        d={
          `M${CX + 9}  ${CY - 9.5}` +
          `Q${CX + 13} ${CY - 12} ${CX + 17} ${CY - 10}` +
          `Q${CX + 19} ${CY - 8.5} ${CX + 18} ${CY - 7}` +
          `Q${CX + 13} ${CY - 6}   ${CX + 9}  ${CY - 8}Z`
        }
        fill={color}
      />

      {/* Ear — sharp triangle at poll */}
      <Path
        d={`M${CX + 9.5} ${CY - 10.5} L${CX + 11} ${CY - 13.5} L${CX + 13} ${CY - 10.5}`}
        fill={color}
      />

      {/* Eye */}
      <Circle cx={CX + 15}   cy={CY - 9.5} r={1}   fill="rgba(255,255,255,0.9)" />
      <Circle cx={CX + 15.2} cy={CY - 9.5} r={0.5} fill="rgba(0,0,0,0.85)" />

      {/* Nostril at muzzle tip */}
      <Circle cx={CX + 17.5} cy={CY - 7.5} r={0.8} fill="rgba(0,0,0,0.4)" />

      {/* Number badge on body */}
      <Circle cx={CX - 2} cy={CY} r={isHighlighted ? 3.8 : 3.2} fill="rgba(0,0,0,0.55)" />
      <SvgText
        x={CX - 2} y={CY + 1.3}
        textAnchor="middle" fill="#fff"
        fontSize={isHighlighted ? 5 : 4} fontWeight="bold">
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
