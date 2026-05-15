import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitCard } from '../components/HabitCard';
import { ProgressRing } from '../components/ProgressRing';
import { HABIT_COLORS } from '../constants/colors';
import { useHabits } from '../context/HabitsContext';
import type { RootStackParamList } from '../navigation/types';
import { todayISO } from '../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = HABIT_COLORS[0];

export default function TodayScreen() {
  const { state, setEntry, archiveHabit } = useHabits();
  const navigation = useNavigation<Nav>();
  const today = todayISO();

  if (!state.hydrated) {
    return (
      <View style={styles.center}>
        <Text>Загрузка…</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressRing progress={dayProgress} color={ACCENT} size={72} strokeWidth={7}>
          <Text style={styles.ringText}>
            {done}/{total}
          </Text>
        </ProgressRing>
        <View style={styles.headerText}>
          <Text style={styles.title}>Сегодня</Text>
          <Text style={styles.subtitle}>{subtitleFor(total, done)}</Text>
        </View>
        <Pressable
          style={styles.addBtn}
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
          <Text style={styles.empty}>Пока пусто. Нажмите «+» чтобы добавить.</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  ringText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 48 },
});
