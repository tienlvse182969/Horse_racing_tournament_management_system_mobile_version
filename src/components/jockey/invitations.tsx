import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailX, Zap, Clock, CircleCheck, CircleX, MapPin, ArrowLeftRight, Trophy, Handshake, Calendar, MessageSquare, X, Check } from 'lucide-react-native';
import Animated, { FadeInDown, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

import { HorseRacingDark as C, SurfaceContainers as SC, Shape, Spacing, FontFamily } from '@/constants/theme';
import { LargeHeaderScrollView } from '@/components/large-header-scroll-view';
import { JockeyAvatarButton } from '@/components/jockey-avatar-button';
import { JockeySuspensionBanner } from '@/components/jockey/jockey-suspension-banner';
import type { Invitation, InvitationStatus } from '@/mock-data';
import { formatCurrency, formatDate, isBeforeBanEnd } from '@/mock-data';
import { useAuth } from '@/context/AuthContext';
import { useJockeyInvitations } from '@/hooks/useJockeyData';
import { ActivityIndicator } from 'react-native';

type FilterType = 'all' | InvitationStatus;
type StatusIcon = React.ComponentType<{ size?: number; color?: string }>;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'pending',  label: 'Chờ phản hồi' },
  { key: 'accepted', label: 'Đã chấp nhận' },
  { key: 'declined', label: 'Đã từ chối' },
];

const STATUS_CONFIG: Record<InvitationStatus, { label: string; color: string; bg: string; Icon: StatusIcon }> = {
  pending:  { label: 'Chờ phản hồi', color: C.secondary, bg: C.secondaryContainer, Icon: Clock        },
  accepted: { label: 'Đã chấp nhận', color: C.tertiary,  bg: C.tertiaryContainer,  Icon: CircleCheck  },
  declined: { label: 'Đã từ chối',   color: C.error,     bg: C.errorContainer,     Icon: CircleX      },
};

export function JockeyInvitations() {
  const { invitations: items, loading, reload, respond } = useJockeyInvitations();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    await respond(id, status === 'accepted' ? 'accept' : 'decline');
    setExpanded(null);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload(false);
    setRefreshing(false);
  }, [reload]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LargeHeaderScrollView
          title="Lời mời"
          contentContainerStyle={styles.scroll}
          rightAction={<JockeyAvatarButton />}
          refreshing={refreshing}
          onRefresh={handleRefresh}>

          <JockeySuspensionBanner />

          {loading && <ActivityIndicator color={C.primary} style={{ marginBottom: Spacing.two }} />}

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
              <MailX size={40} color={C.onSurfaceVariant} style={{ opacity: 0.4 }} />
              <Text style={styles.emptyText}>Không có lời mời nào</Text>
            </View>
          ) : (
            filtered.map((inv, i) => (
              <Animated.View key={inv.id} entering={FadeInDown.delay(i * 50).duration(280)}>
                <InvitationCard
                  invitation={inv}
                  isExpanded={expanded === inv.id}
                  onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                  onAccept={() => handleRespond(inv.id, 'accepted')}
                  onDecline={() => handleRespond(inv.id, 'declined')}
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
  const { user } = useAuth();
  const locked = isBeforeBanEnd(inv.race.date, inv.race.time, user?.penaltyStatus?.bannedUntil);

  type DetailRow = { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string };
  const detailRows: DetailRow[] = [
    { Icon: Zap,          label: 'Giống ngựa', value: `${inv.horse.breed} · ${inv.horse.age} tuổi` },
    { Icon: MapPin,       label: 'Địa điểm',   value: inv.race.location },
    { Icon: ArrowLeftRight, label: 'Cự ly',    value: `${inv.race.distance}m · ${inv.race.surface}` },
    { Icon: Trophy,       label: 'Giải thưởng', value: formatCurrency(inv.race.purse) },
    { Icon: Handshake,    label: 'Chủ ngựa',   value: inv.ownerName },
    { Icon: Calendar,     label: 'Lời mời gửi', value:
        new Date(inv.sentAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' +
        new Date(inv.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
  ];

  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      {/* Header row */}
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} disabled={locked} activeOpacity={0.85}>
        <View style={[styles.horseIcon, { backgroundColor: `${inv.horse.color}22`, borderColor: `${inv.horse.color}55` }]}>
          <Zap size={22} color={inv.horse.color} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.horseName} numberOfLines={1}>{inv.horse.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <sc.Icon size={10} color={sc.color} />
              <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>
          <Text style={styles.raceName}>{inv.race.name}</Text>
          <View style={styles.raceMeta}>
            <Clock size={11} color={C.onSurfaceVariant} />
            <Text style={styles.raceMetaText}>{formatDate(inv.race.date)} · {inv.race.time}</Text>
          </View>
        </View>
        <View style={[styles.chevron, isExpanded && styles.chevronUp]}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {isExpanded && (
        <View style={styles.detail}>
          <View style={styles.detailGrid}>
            {detailRows.map(row => (
              <View key={row.label} style={styles.detailRow}>
                <row.Icon size={14} color={C.onSurfaceVariant} />
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {inv.message && (
            <View style={styles.messageBox}>
              <MessageSquare size={14} color={C.onPrimaryContainer} />
              <Text style={styles.messageText}>{inv.message}</Text>
            </View>
          )}

          {inv.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.85}>
                <X size={16} color={C.error} />
                <Text style={styles.declineBtnText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
                <Check size={16} color={C.onTertiary} />
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
  cardLocked:  { opacity: 0.45 },
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
  chevronUp:   { transform: [{ rotate: '90deg' }] },
  chevronText: { color: C.onSurfaceVariant, fontSize: 18, lineHeight: 22 },

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
