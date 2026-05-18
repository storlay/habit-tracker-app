import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Heatmap } from '../components/Heatmap';
import { PeriodChart } from '../components/PeriodChart';
import { StreakBadge } from '../components/StreakBadge';
import { useHabits } from '../context/HabitsContext';
import { useTheme } from '../context/SettingsContext';
import type { Entry, Habit } from '../types';
import { bestStreak, currentStreak, type Period } from '../utils/stats';

export default function StatsScreen() {
  const { state } = useHabits();
  const { colors } = useTheme();
  const active = state.habits.filter((h) => !h.archived);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30d');

  if (!state.hydrated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Загрузка…</Text>
      </View>
    );
  }

  if (active.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="stats-chart-outline" size={48} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет данных</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Создайте привычку на вкладке «Сегодня», чтобы увидеть статистику
        </Text>
      </View>
    );
  }

  const habit = active.find((h) => h.id === selectedId) ?? active[0];

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
    >
      <HabitPicker habits={active} selected={habit} onSelect={(id) => setSelectedId(id)} />
      <StreakInfo habit={habit} entries={state.entries[habit.id] ?? {}} />
      <Section title="Календарь">
        <Heatmap habit={habit} entries={state.entries[habit.id] ?? {}} />
      </Section>
      <Section title="Динамика">
        <PeriodChart
          habit={habit}
          entries={state.entries[habit.id] ?? {}}
          period={period}
          onChangePeriod={setPeriod}
        />
      </Section>
    </ScrollView>
  );
}

function HabitPicker({
  habits,
  selected,
  onSelect,
}: {
  habits: Habit[];
  selected: Habit;
  onSelect: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.picker}
    >
      {habits.map((h) => {
        const active = h.id === selected.id;
        return (
          <Pressable
            key={h.id}
            onPress={() => onSelect(h.id)}
            style={[
              styles.pickerChip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              active && { backgroundColor: h.color, borderColor: h.color },
            ]}
          >
            <Ionicons name={h.icon} size={14} color={active ? '#fff' : h.color} />
            <Text
              style={[
                styles.pickerText,
                { color: active ? '#fff' : colors.text },
              ]}
            >
              {h.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function StreakInfo({ habit, entries }: { habit: Habit; entries: Record<string, Entry> }) {
  const { current, best } = useMemo(
    () => ({ current: currentStreak(entries), best: bestStreak(entries) }),
    [entries],
  );
  return <StreakBadge current={current} best={best} color={habit.color} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  picker: { gap: 8, paddingRight: 12 },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pickerText: { fontSize: 13, fontWeight: '500' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
});
