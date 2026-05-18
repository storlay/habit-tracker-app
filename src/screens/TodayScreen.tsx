import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitCard } from '../components/HabitCard';
import { ProgressRing } from '../components/ProgressRing';
import { useHabits } from '../context/HabitsContext';
import { useTheme } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';
import { todayISO } from '../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TodayScreen() {
  const { state, setEntry, archiveHabit } = useHabits();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const today = todayISO();

  if (!state.hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Загрузка…</Text>
      </View>
    );
  }

  const active = state.habits.filter((h) => !h.archived);
  const isDone = (id: string) => state.entries[id]?.[today]?.completed ?? false;
  const sorted = [...active].sort((a, b) => Number(isDone(a.id)) - Number(isDone(b.id)));
  const done = active.reduce((n, h) => n + (isDone(h.id) ? 1 : 0), 0);
  const total = active.length;
  const dayProgress = total === 0 ? 0 : done / total;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <ProgressRing progress={dayProgress} color={colors.primary} size={72} strokeWidth={7}>
          <Text style={[styles.ringText, { color: colors.text }]}>
            {done}/{total}
          </Text>
        </ProgressRing>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Сегодня</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitleFor(total, done)}
          </Text>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('HabitForm')}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            Пока пусто. Нажмите «+» чтобы добавить.
          </Text>
        }
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            entry={state.entries[item.id]?.[today]}
            onSetValue={(v) => setEntry(item.id, today, v)}
            onEdit={() => navigation.navigate('HabitForm', { habitId: item.id })}
            onArchive={() => archiveHabit(item.id)}
          />
        )}
      />
    </View>
  );
}

function subtitleFor(total: number, done: number): string {
  if (total === 0) return 'Добавьте первую привычку';
  if (done === total) return 'Все привычки выполнены!';
  return `Осталось ${total - done}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  ringText: { fontSize: 13, fontWeight: '700' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 48 },
});
