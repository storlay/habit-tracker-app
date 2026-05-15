import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHabits } from '../context/HabitsContext';
import { todayISO } from '../utils/date';

export default function TodayScreen() {
  const { state, addHabit, toggleBinary } = useHabits();
  const today = todayISO();

  if (!state.hydrated) {
    return (
      <View style={styles.center}>
        <Text>Загрузка…</Text>
      </View>
    );
  }

  const active = state.habits.filter((h) => !h.archived);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Сегодня</Text>

      <Pressable
        style={styles.addBtn}
        onPress={() =>
          addHabit({
            title: `Тест ${active.length + 1}`,
            type: 'binary',
            categoryId: state.categories[0]?.id ?? 'cat-health',
            color: '#22c55e',
            icon: 'checkmark',
            weeklyGoal: 7,
          })
        }
      >
        <Text style={styles.addBtnText}>+ Добавить тестовую привычку</Text>
      </Pressable>

      <FlatList
        data={active}
        keyExtractor={(h) => h.id}
        ListEmptyComponent={<Text style={styles.empty}>Пока пусто</Text>}
        renderItem={({ item }) => {
          const done = (state.entries[item.id]?.[today]?.value ?? 0) > 0;
          return (
            <Pressable style={styles.row} onPress={() => toggleBinary(item.id, today)}>
              <Text style={[styles.rowText, done && styles.rowDone]}>
                {done ? '✓ ' : '○ '}
                {item.title}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  addBtn: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 16 },
  rowDone: { color: '#888', textDecorationLine: 'line-through' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
