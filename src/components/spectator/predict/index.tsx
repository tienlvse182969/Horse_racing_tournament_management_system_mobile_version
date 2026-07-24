import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Gift } from 'lucide-react-native';

import { Shape, Spacing, FontFamily, type AppColors, type SurfaceColors } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { HeaderActions } from '@/components/header-actions';
import { useAppColors, useThemedStyles } from '@/hooks/use-theme';
import { useSpectatorPoints, useSpectatorPredictions } from '@/hooks/useSpectatorData';
import { formatNumber } from '@/mock-data';
import { PredictForm } from './predict-form';
import { PredictionHistory } from './history';

type Tab = 'predict' | 'history';

export function SpectatorPredict() {
  const { C } = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState<Tab>('predict');
  const { balance } = useSpectatorPoints();
  const { predictions, reload, cancelPrediction } = useSpectatorPredictions();

  const totalPoints  = balance;
  const totalRewards = predictions.reduce((s, p) => s + (p.reward ?? 0), 0);

  const handleSubmitted = () => {
    reload();
    setTab('history');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Dự đoán" contentContainerStyle={styles.scroll} rightAction={<HeaderActions />}>

          {/* Points banner */}
          <View style={styles.pointsBanner}>
            <View style={styles.pointsItem}>
              <Star size={18} color={C.secondary} />
              <Text style={styles.pointsValue}>{formatNumber(totalPoints)}</Text>
              <Text style={styles.pointsLabel}>Số dư ví điểm</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Gift size={18} color={C.primary} />
              <Text style={[styles.pointsValue, { color: C.primary }]}>
                {formatNumber(totalRewards)}
              </Text>
              <Text style={styles.pointsLabel}>Tổng điểm thưởng nhận được</Text>
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
              <Text style={[styles.tabBtnText, tab === 'history' && styles.tabBtnTextActive]}>Các phiếu dự đoán</Text>
            </TouchableOpacity>
          </View>

          {tab === 'predict' && <PredictForm onSubmitted={handleSubmitted} />}
          {tab === 'history' && <PredictionHistory predictions={predictions} onCancel={cancelPrediction} />}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
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
}
