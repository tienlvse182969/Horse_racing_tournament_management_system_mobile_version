import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import Animated, { FadeOut } from 'react-native-reanimated';

import { FontFamily } from '@/constants/theme';

const FADE_DURATION = 400;
const DISPLAY_DURATION = 2500;

export function StartupSplash({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);

  const player = useVideoPlayer(require('@/assets/images/startup_video.mp4'), (p) => {
    p.muted = true;
    p.loop = false;
    p.play();
  });

  const handleFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setVisible(false);
    onFinish();
  };

  useEventListener(player, 'playToEnd', handleFinish);

  useEffect(() => {
    const timer = setTimeout(handleFinish, DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={styles.container}
      exiting={FadeOut.duration(FADE_DURATION)}
      onTouchEnd={handleFinish}
    >
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.logo}>RACETRACK VN</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bangers,
    fontSize: 40,
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
