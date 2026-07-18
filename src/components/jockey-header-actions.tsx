import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { JockeyPointsChip } from './jockey-points-chip';
import { JockeyAvatarButton } from './jockey-avatar-button';

export function JockeyHeaderActions() {
  return (
    <View style={styles.row}>
      <JockeyPointsChip />
      <JockeyAvatarButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
