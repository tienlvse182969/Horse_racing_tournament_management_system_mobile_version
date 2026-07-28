import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { FileText, LogOut, RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ownerApi, type JockeySearchItem, type OwnerHorse, type OwnerInvitation, type OwnerRace, type OwnerRegistration, type OwnerTournament } from '@/api/owner.api';
import { useAuth } from '@/context/AuthContext';
import { FontFamily, HorseRacingDark as C, Shape, Spacing } from '@/constants/theme';

const BREEDS = ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Standardbred', 'Warmblood', 'Other'];

function formatDate(value?: string) {
  if (!value) return 'Chưa có lịch';
  return new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusLabel(value: string) {
  const map: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối',
    scheduled: 'Đã lên lịch',
    ongoing: 'Đang diễn ra',
    completed: 'Đã hoàn tất',
    accepted: 'Đã nhận lời',
    declined: 'Đã từ chối',
  };
  return map[value] ?? value;
}

export default function OwnerHome() {
  const { user, logout } = useAuth();
  const [horses, setHorses] = useState<OwnerHorse[]>([]);
  const [registrations, setRegistrations] = useState<OwnerRegistration[]>([]);
  const [tournaments, setTournaments] = useState<OwnerTournament[]>([]);
  const [races, setRaces] = useState<OwnerRace[]>([]);
  const [invitations, setInvitations] = useState<OwnerInvitation[]>([]);
  const [jockeys, setJockeys] = useState<JockeySearchItem[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [selectedJockeyId, setSelectedJockeyId] = useState('');
  const [jockeyQuery, setJockeyQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingHorse, setSavingHorse] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    breed: BREEDS[0],
    age: '3',
    weight: '',
    color: '',
    trainerName: '',
    registrationId: '',
    profilePdfUrl: '',
    profilePdfName: '',
  });

  const approvedRegistrations = useMemo(
    () => registrations.filter((item) => item.status === 'approved'),
    [registrations],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [horseRes, regRes, tournamentRes, invitationRes] = await Promise.all([
        ownerApi.listHorses(),
        ownerApi.listRegistrations(),
        ownerApi.listTournaments(),
        ownerApi.listInvitations(),
      ]);
      setHorses(horseRes.data);
      setRegistrations(regRes.data);
      setTournaments(tournamentRes.items);
      setInvitations(invitationRes.data);
      setSelectedHorseId((current) => current || horseRes.data[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu Chủ ngựa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function pickHorsePdf() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      Alert.alert('Tệp quá lớn', 'Vui lòng chọn file PDF dưới 10MB.');
      return;
    }
    setError('');
    const response = await ownerApi.uploadHorsePdf(asset.uri, asset.mimeType);
    setForm((current) => ({
      ...current,
      profilePdfUrl: response.data.url,
      profilePdfName: response.data.name || asset.name,
    }));
  }

  async function createHorse() {
    setError('');
    setNotice('');
    if (!form.name.trim()) {
      setError('Tên ngựa là bắt buộc.');
      return;
    }
    if (!form.profilePdfUrl || !form.profilePdfName) {
      setError('Vui lòng tải hồ sơ ngựa PDF trước khi đăng ký.');
      return;
    }
    setSavingHorse(true);
    try {
      const response = await ownerApi.createHorse({
        name: form.name.trim(),
        breed: form.breed,
        age: Number(form.age) || 1,
        weight: form.weight ? Number(form.weight) : undefined,
        color: form.color.trim() || undefined,
        trainerName: form.trainerName.trim() || undefined,
        registrationId: form.registrationId.trim() || undefined,
        profilePdfUrl: form.profilePdfUrl,
        profilePdfName: form.profilePdfName,
      });
      setHorses((current) => [response.data, ...current]);
      setSelectedHorseId(response.data.id);
      setForm({ name: '', breed: BREEDS[0], age: '3', weight: '', color: '', trainerName: '', registrationId: '', profilePdfUrl: '', profilePdfName: '' });
      setNotice('Đã tạo hồ sơ ngựa. Khi gửi đơn tham gia giải, quản trị viên sẽ duyệt hồ sơ PDF.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo hồ sơ ngựa.');
    } finally {
      setSavingHorse(false);
    }
  }

  async function loadRaces(tournamentId: string) {
    setSelectedTournamentId(tournamentId);
    setSelectedRaceId('');
    const response = await ownerApi.listRacesForTournament(tournamentId);
    setRaces(response.races);
  }

  async function registerRace() {
    if (!selectedRaceId || !selectedHorseId) {
      setError('Vui lòng chọn ngựa và cuộc đua.');
      return;
    }
    setError('');
    const response = await ownerApi.registerForRace(selectedRaceId, selectedHorseId);
    setRegistrations((current) => [response.data, ...current]);
    setNotice('Đã gửi đơn đăng ký cuộc đua. Vui lòng chờ quản trị viên xét duyệt.');
  }

  async function searchJockeys() {
    if (!jockeyQuery.trim()) {
      setJockeys([]);
      return;
    }
    const response = await ownerApi.searchJockeys(jockeyQuery.trim());
    setJockeys(response.data);
  }

  async function inviteJockey() {
    if (!selectedRaceId || !selectedHorseId || !selectedJockeyId) {
      setError('Vui lòng chọn cuộc đua, ngựa và nài ngựa.');
      return;
    }
    setError('');
    const response = await ownerApi.inviteJockey(selectedRaceId, selectedHorseId, selectedJockeyId, message.trim() || undefined);
    setInvitations((current) => [response.data, ...current]);
    setNotice('Đã gửi lời mời thi đấu cho nài ngựa.');
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/auth' as never);
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Khu làm việc Chủ ngựa</Text>
            <Text style={styles.title}>{user?.fullName ?? 'Chủ ngựa'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => void loadAll()} disabled={loading}>
              <RefreshCw color={C.onSurface} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => void handleLogout()}>
              <LogOut color={C.error} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {!!notice && <Text style={styles.notice}>{notice}</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.metrics}>
          <Metric label="Ngựa" value={horses.length} />
          <Metric label="Đơn chờ" value={registrations.filter((item) => item.status === 'pending').length} />
          <Metric label="Lời mời" value={invitations.length} />
        </View>

        <Section title="Tạo hồ sơ ngựa">
          <TextInput label="Tên ngựa" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} mode="outlined" />
          <View style={styles.rowWrap}>
            {BREEDS.map((breed) => (
              <TouchableOpacity key={breed} style={[styles.chip, form.breed === breed && styles.chipActive]} onPress={() => setForm((p) => ({ ...p, breed }))}>
                <Text style={[styles.chipText, form.breed === breed && styles.chipTextActive]}>{breed}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.grid}>
            <TextInput label="Tuổi" value={form.age} onChangeText={(v) => setForm((p) => ({ ...p, age: v }))} keyboardType="number-pad" mode="outlined" style={styles.gridInput} />
            <TextInput label="Cân nặng" value={form.weight} onChangeText={(v) => setForm((p) => ({ ...p, weight: v }))} keyboardType="number-pad" mode="outlined" style={styles.gridInput} />
          </View>
          <TextInput label="Màu lông / đặc điểm" value={form.color} onChangeText={(v) => setForm((p) => ({ ...p, color: v }))} mode="outlined" />
          <TextInput label="Huấn luyện viên" value={form.trainerName} onChangeText={(v) => setForm((p) => ({ ...p, trainerName: v }))} mode="outlined" />
          <TextInput label="Mã đăng ký" value={form.registrationId} onChangeText={(v) => setForm((p) => ({ ...p, registrationId: v }))} mode="outlined" />
          <TouchableOpacity style={styles.uploadBtn} onPress={() => void pickHorsePdf()}>
            <FileText color={C.primary} size={18} />
            <Text style={styles.uploadText}>{form.profilePdfName || 'Chọn hồ sơ ngựa PDF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => void createHorse()} disabled={savingHorse}>
            <Text style={styles.primaryText}>{savingHorse ? 'Đang lưu...' : 'Tạo hồ sơ ngựa'}</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Ngựa của tôi">
          {horses.map((horse) => (
            <TouchableOpacity key={horse.id} style={[styles.item, selectedHorseId === horse.id && styles.itemActive]} onPress={() => setSelectedHorseId(horse.id)}>
              <Text style={styles.itemTitle}>{horse.name}</Text>
              <Text style={styles.itemSub}>{horse.breed} • {horse.age} tuổi • {statusLabel(horse.healthStatus)}</Text>
              <Text style={styles.itemSub}>{horse.profilePdfName ? `PDF: ${horse.profilePdfName}` : 'Chưa có PDF'}</Text>
            </TouchableOpacity>
          ))}
          {!horses.length && <Text style={styles.empty}>Chưa có hồ sơ ngựa.</Text>}
        </Section>

        <Section title="Đăng ký tham gia giải đấu">
          <Text style={styles.help}>Chọn giải đấu, chọn cuộc đua, rồi gửi đơn cho ngựa đang chọn.</Text>
          {tournaments.map((tournament) => (
            <TouchableOpacity key={tournament._id} style={[styles.item, selectedTournamentId === tournament._id && styles.itemActive]} onPress={() => void loadRaces(tournament._id)}>
              <Text style={styles.itemTitle}>{tournament.name}</Text>
              <Text style={styles.itemSub}>{tournament.location} • {statusLabel(tournament.status)}</Text>
            </TouchableOpacity>
          ))}
          {races.map((race) => {
            const id = race.id ?? race._id ?? '';
            return (
              <TouchableOpacity key={id} style={[styles.item, selectedRaceId === id && styles.itemActive]} onPress={() => setSelectedRaceId(id)}>
                <Text style={styles.itemTitle}>{race.name}</Text>
                <Text style={styles.itemSub}>Vòng {race.round} • {formatDate(race.scheduledAt)} • {statusLabel(race.status)}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => void registerRace()}>
            <Text style={styles.primaryText}>Gửi đơn đăng ký</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Thuê nài ngựa">
          <Text style={styles.help}>Chỉ mời được khi đơn đăng ký của ngựa đã được quản trị viên duyệt.</Text>
          <TextInput label="Tìm nài ngựa theo tên" value={jockeyQuery} onChangeText={setJockeyQuery} mode="outlined" />
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => void searchJockeys()}>
            <Text style={styles.secondaryText}>Tìm nài ngựa</Text>
          </TouchableOpacity>
          {jockeys.map((jockey) => (
            <TouchableOpacity key={jockey.id} style={[styles.item, selectedJockeyId === jockey.id && styles.itemActive]} onPress={() => setSelectedJockeyId(jockey.id)}>
              <Text style={styles.itemTitle}>{jockey.fullName}</Text>
              <Text style={styles.itemSub}>{jockey.licenseNumber ? `Mã giấy phép: ${jockey.licenseNumber}` : 'Chưa có mã giấy phép'}</Text>
            </TouchableOpacity>
          ))}
          <TextInput label="Lời nhắn" value={message} onChangeText={setMessage} mode="outlined" multiline />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => void inviteJockey()}>
            <Text style={styles.primaryText}>Gửi lời mời</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Đơn đăng ký và lời mời">
          {registrations.map((reg) => (
            <View key={reg.id} style={styles.item}>
              <Text style={styles.itemTitle}>{reg.horse.name} → {reg.race.name}</Text>
              <Text style={styles.itemSub}>{statusLabel(reg.status)} • {formatDate(reg.race.scheduledAt)}</Text>
            </View>
          ))}
          {approvedRegistrations.length === 0 && <Text style={styles.help}>Chưa có đơn đã duyệt để mời nài ngựa.</Text>}
          {invitations.map((inv) => (
            <View key={inv.id} style={styles.item}>
              <Text style={styles.itemTitle}>{inv.horse.name} • {inv.jockey?.fullName ?? 'Nài ngựa'}</Text>
              <Text style={styles.itemSub}>{inv.race.name} • {statusLabel(inv.status)}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: C.primary, fontFamily: FontFamily.bold, fontSize: 12, textTransform: 'uppercase' },
  title: { color: C.onBackground, fontFamily: FontFamily.bold, fontSize: 26 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  notice: { color: C.primary, backgroundColor: `${C.primary}1A`, borderRadius: Shape.medium, padding: 12, fontFamily: FontFamily.medium },
  error: { color: C.error, backgroundColor: `${C.error}1A`, borderRadius: Shape.medium, padding: 12, fontFamily: FontFamily.medium },
  metrics: { flexDirection: 'row', gap: Spacing.two },
  metric: { flex: 1, backgroundColor: C.surface, borderRadius: Shape.large, padding: Spacing.two },
  metricValue: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 22 },
  metricLabel: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  section: { gap: Spacing.two, backgroundColor: C.surface, borderRadius: Shape.large, padding: Spacing.three },
  sectionTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 18 },
  help: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: Shape.full, borderWidth: 1, borderColor: C.outline, paddingVertical: 8, paddingHorizontal: 12 },
  chipActive: { borderColor: C.primary, backgroundColor: `${C.primary}22` },
  chipText: { color: C.onSurfaceVariant, fontFamily: FontFamily.medium, fontSize: 12 },
  chipTextActive: { color: C.primary },
  grid: { flexDirection: 'row', gap: Spacing.two },
  gridInput: { flex: 1 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: Shape.medium, borderWidth: 1, borderStyle: 'dashed', borderColor: C.primary, padding: 13 },
  uploadText: { color: C.primary, fontFamily: FontFamily.bold, flex: 1 },
  primaryBtn: { backgroundColor: C.primary, borderRadius: Shape.full, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: C.onPrimary, fontFamily: FontFamily.bold, fontSize: 15 },
  secondaryBtn: { borderRadius: Shape.full, borderWidth: 1, borderColor: C.outline, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: C.onSurface, fontFamily: FontFamily.bold },
  item: { borderWidth: 1, borderColor: C.outline, borderRadius: Shape.medium, padding: Spacing.two, gap: 4 },
  itemActive: { borderColor: C.primary, backgroundColor: `${C.primary}16` },
  itemTitle: { color: C.onSurface, fontFamily: FontFamily.bold, fontSize: 15 },
  itemSub: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 12 },
  empty: { color: C.onSurfaceVariant, fontFamily: FontFamily.regular, fontSize: 13 },
});
