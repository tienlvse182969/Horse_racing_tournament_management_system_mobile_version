import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import type { Invitation, InvitationStatus } from '@/mock-data';
import { invitations as initialInvitations, formatCurrency, formatDate } from '@/mock-data';

type FilterType = 'all' | InvitationStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'pending',  label: 'Chờ phản hồi' },
  { key: 'accepted', label: 'Đã chấp nhận' },
  { key: 'declined', label: 'Đã từ chối' },
];

const STATUS_CONFIG: Record<InvitationStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:  { label: 'Chờ phản hồi',  color: C.secondary,  bg: C.secondaryContainer,  icon: 'clock-outline' },
  accepted: { label: 'Đã chấp nhận', color: C.tertiary,   bg: C.tertiaryContainer,   icon: 'check-circle-outline' },
  declined: { label: 'Đã từ chối',   color: C.error,      bg: C.errorContainer,      icon: 'close-circle-outline' },
};

export function JockeyInvitations() {
  const [items, setItems] = useState<Invitation[]>(initialInvitations);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  const respond = (id: string, status: 'accepted' | 'declined') => {
    setItems(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    setExpanded(null);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView title="Lời mời" contentContainerStyle={styles.scroll} rightAction={<JockeyAvatarButton />}>

          {/* Filter chips */}
          <View style={styles.filterRow}>
            {FILTERS.map(f => {
              const count = f.key === 'all' ? items.length : items.filter(i => i.status === f.key).length;
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                  <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
                    <Text style={[styles.chipBadgeText, active && styles.chipBadgeTextActive]}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cards */}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={styles.emptyText}>Không có lời mời nào</Text>
            </View>
          ) : (
            filtered.map((inv, i) => (
              <Animated.View key={inv.id} entering={FadeInDown.delay(i * 50).duration(280)}>
                <InvitationCard
                  invitation={inv}
                  isExpanded={expanded === inv.id}
                  onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                  onAccept={() => respond(inv.id, 'accepted')}
                  onDecline={() => respond(inv.id, 'declined')}
                />
              </Animated.View>
            ))
          )}

        </LargeHeaderScrollView>
      </SafeAreaView>
    </View>
  );
}

function InvitationCard({
  invitation: inv,
  isExpanded,
  onToggle,
  onAccept,
  onDecline,
}: {
  invitation: Invitation;
  isExpanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const sc = STATUS_CONFIG[inv.status];

  return (
    <View style={styles.card}>
      {/* Header row */}
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.85}>
        <View style={[styles.horseIcon, { backgroundColor: `${inv.horse.color}22`, borderColor: `${inv.horse.color}55` }]}>
          <Text style={{ fontSize: 22 }}>🐎</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.horseName} numberOfLines={1}>{inv.horse.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <MaterialCommunityIcons name={sc.icon as any} size={10} color={sc.color} />
              <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>
          <Text style={styles.raceName}>{inv.race.name}</Text>
          <View style={styles.raceMeta}>
            <MaterialCommunityIcons name="clock-outline" size={11} color={C.onSurfaceVariant} />
            <Text style={styles.raceMetaText}>{formatDate(inv.race.date)} · {inv.race.time}</Text>
          </View>
        </View>
        <View style={[styles.chevron, isExpanded && styles.chevronUp]}>
          <MaterialCommunityIcons name="chevron-down" size={18} color={C.onSurfaceVariant} />
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {isExpanded && (
        <View style={styles.detail}>
          <View style={styles.detailGrid}>
            {[
              { icon: '🐴', label: 'Giống ngựa',   value: `${inv.horse.breed} · ${inv.horse.age} tuổi` },
              { icon: '📍', label: 'Địa điểm',     value: inv.race.location },
              { icon: '📏', label: 'Cự ly',         value: `${inv.race.distance}m · ${inv.race.surface}` },
              { icon: '🏆', label: 'Giải thưởng',  value: formatCurrency(inv.race.purse) },
              { icon: '🤝', label: 'Chủ ngựa',     value: inv.ownerName },
              { icon: '📅', label: 'Lời mời gửi',  value: new Date(inv.sentAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + new Date(inv.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={{ fontSize: 14, width: 20 }}>{row.icon}</Text>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {inv.message && (
            <View style={styles.messageBox}>
              <Text style={{ fontSize: 14 }}>💬</Text>
              <Text style={styles.messageText}>{inv.message}</Text>
            </View>
          )}

          {inv.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.85}>
                <MaterialCommunityIcons name="close" size={16} color={C.error} />
                <Text style={styles.declineBtnText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
                <MaterialCommunityIcons name="check" size={16} color={C.onTertiary} />
                <Text style={styles.acceptBtnText}>Chấp nhận</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: SC.lowest },
  safeArea:{ flex: 1 },
  scroll:  { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: SC.high, borderRadius: Shape.full, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.outlineVariant },
  chipActive:{ backgroundColor: C.primary, borderColor: 'transparent' },
  chipText:  { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 13 },
  chipTextActive: { color: C.onPrimary },
  chipBadge: { backgroundColor: C.outlineVariant, borderRadius: Shape.full, minWidth: 20, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  chipBadgeActive:{ backgroundColor: 'rgba(255,255,255,0.3)' },
  chipBadgeText: { color: C.onSurfaceVariant, fontFamily: FontFamily.bold, fontSize: 10 },
  chipBadgeTextActive: { color: '#FFFFFF' },

  empty:     { alignItems: 'center', paddingVertical: 48, gap: Spacing.two },
  emptyText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 14 },

  card:        { backgroundColor: SC.high, borderRadius: Shape.large, overflow: 'hidden', marginBottom: 0 },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.two, gap: Spacing.two },
  horseIcon:   { width: 48, height: 48, borderRadius: Shape.medium, borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardInfo:    { flex: 1, gap: 3 },
  cardTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  horseName:   { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: Shape.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:  { fontFamily: FontFamily.bold, fontSize: 10 },
  raceName:    { color: C.primary, fontFamily: FontFamily.medium, fontSize: 13 },
  raceMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  raceMetaText:{ color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 11 },
  chevron:     { width: 28, height: 28, borderRadius: Shape.full, backgroundColor: SC.highest, justifyContent: 'center', alignItems: 'center' },
  chevronUp:   { transform: [{ rotate: '180deg' }] },

  detail:      { paddingHorizontal: Spacing.two, paddingBottom: Spacing.two, gap: Spacing.two, borderTopWidth: 1, borderTopColor: `${C.outlineVariant}40` },
  detailGrid:  { backgroundColor: SC.base, borderRadius: Shape.large, padding: Spacing.two, gap: Spacing.one, marginTop: Spacing.one },
  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  detailLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12, width: 72 },
  detailValue: { color: C.onSurface, fontFamily: FontFamily.medium, fontSize: 13, flex: 1 },
  messageBox:  { backgroundColor: C.primaryContainer, borderRadius: Shape.large, padding: Spacing.two, flexDirection: 'row', gap: Spacing.one },
  messageText: { color: C.onPrimaryContainer, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 20, fontStyle: 'italic', flex: 1 },
  actionRow:   { flexDirection: 'row', gap: Spacing.two },
  declineBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.errorContainer, borderRadius: Shape.large, paddingVertical: 13 },
  declineBtnText: { color: C.error, fontFamily: FontFamily.bold, fontSize: 14 },
  acceptBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.tertiary, borderRadius: Shape.large, paddingVertical: 13 },
  acceptBtnText: { color: C.onTertiary, fontFamily: FontFamily.bold, fontSize: 14 },
});
