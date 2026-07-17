import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Moon, Smartphone, Sun, X } from 'lucide-react-native';

import { FontFamily, Shape, Spacing } from '@/constants/theme';
import type { AppColors, SurfaceColors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import type { ThemeMode } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-theme';

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light',  label: 'Sáng',          Icon: Sun },
  { mode: 'dark',   label: 'Tối',           Icon: Moon },
  { mode: 'system', label: 'Theo hệ thống', Icon: Smartphone },
];

export function ThemeModeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { mode, setMode, C } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color={C.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.title}>Giao diện</Text>
          {OPTIONS.map(opt => {
            const selected = mode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                style={[styles.row, selected && styles.rowSelected]}
                activeOpacity={0.75}
                onPress={() => { setMode(opt.mode); onClose(); }}>
                <View style={[styles.rowIconWrap, selected && styles.rowIconWrapSelected]}>
                  <opt.Icon size={18} color={selected ? C.primary : C.onSurfaceVariant} />
                </View>
                <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{opt.label}</Text>
                {selected && <Check size={18} color={C.primary} />}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(C: AppColors, SC: SurfaceColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
    card:     { width: '100%', maxWidth: 320, backgroundColor: SC.high, borderRadius: Shape.large, padding: Spacing.four, gap: Spacing.one },
    closeBtn: { position: 'absolute', top: Spacing.two, right: Spacing.two, width: 32, height: 32, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    title:    { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 17, marginBottom: Spacing.two },

    row:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Shape.medium, padding: Spacing.two, backgroundColor: SC.base },
    rowSelected:  { backgroundColor: `${C.primary}1F` },
    rowIconWrap:  { width: 32, height: 32, borderRadius: Shape.medium, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
    rowIconWrapSelected: { backgroundColor: `${C.primary}33` },
    rowLabel:     { flex: 1, color: C.onSurface, fontFamily: FontFamily.regular, fontSize: 14 },
    rowLabelSelected: { fontFamily: FontFamily.bold, color: C.primary },
  });
}
