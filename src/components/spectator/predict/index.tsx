import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Gift } from 'lucide-react-native';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { AvatarTabButton } from '@/components/avatar-tab-button';
import { useSpectatorPoints, useSpectatorPredictions } from '@/hooks/useSpectatorData';
import { PredictForm } from './predict-form';
import { PredictionHistory } from './history';

type Tab = 'predict' | 'history';

export function SpectatorPredict() {
  const [tab, setTab] = useState<Tab>('predict');
  const { balance } = useSpectatorPoints();
  const { predictions, reload } = useSpectatorPredictions();

  const totalPoints  = balance;
  const totalRewards = predictions.reduce((s, p) => s + (p.reward ?? 0), 0);

  const handleSubmitted = () => {
    reload();
    setTab('history');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Dự đoán" contentContainerStyle={styles.scroll} rightAction={<AvatarTabButton />}>

          {/* Points banner */}
          <View style={styles.pointsBanner}>
            <View style={styles.pointsItem}>
              <Star size={18} color={C.secondary} />
              <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>Điểm tích lũy</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Gift size={18} color={C.primary} />
              <Text style={[styles.pointsValue, { color: C.primary }]}>
                {(totalRewards / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.pointsLabel}>Tổng thưởng</Text>
            </View>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'predict' && styles.tabBtnActive]}
              onPress={() => setTab('predict')}
              activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, tab === 'predict' && styles.tabBtnTextActive]}>Dự đoán</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
              onPress={() => setTab('history')}
              activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, tab === 'history' && styles.tabBtnTextActive]}>Lịch sử</Text>
            </TouchableOpacity>
          </View>

          {tab === 'predict' && <PredictForm onSubmitted={handleSubmitted} />}
          {tab === 'history' && <PredictionHistory predictions={predictions} />}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },

  pointsBanner:  { flexDirection: 'row', backgroundColor: C.secondaryContainer, borderRadius: Shape.large, padding: Spacing.three, alignItems: 'center' },
  pointsItem:    { flex: 1, alignItems: 'center', gap: 3 },
  pointsValue:   { color: C.secondary, fontFamily: FontFamily.bold, fontSize: 20 },
  pointsLabel:   { color: C.onSecondaryContainer, fontFamily: FontFamily.regular, fontSize: 11 },
  pointsDivider: { width: 1, height: 40, backgroundColor: `${C.onSurfaceVariant}30` },

  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: SC.base,
    borderRadius: Shape.full,
    padding: 4,
  },
  tabBtn:          { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Shape.full },
  tabBtnActive:    { backgroundColor: C.secondary },
  tabBtnText:      { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },
  tabBtnTextActive:{ color: C.onSecondary },
});
