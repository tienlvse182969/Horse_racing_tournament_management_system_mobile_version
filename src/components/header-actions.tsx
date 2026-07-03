import { View, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { PointsChip } from './points-chip';
import { AvatarTabButton } from './avatar-tab-button';

export function HeaderActions() {
  return (
    <View style={styles.row}>
      <PointsChip />
      <AvatarTabButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
