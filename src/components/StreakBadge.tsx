import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  current: number;
  best: number;
  color: string;
};

export function StreakBadge({ current, best, color }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.box, { borderColor: color + '55' }]}>
        <View style={styles.head}>
          <Ionicons name="flame" size={16} color={color} />
          <Text style={styles.caption}>Сейчас</Text>
        </View>
        <Text style={styles.value}>{current}</Text>
        <Text style={styles.unit}>{dayWord(current)}</Text>
      </View>
      <View style={[styles.box, { borderColor: '#e5e7eb' }]}>
        <View style={styles.head}>
          <Ionicons name="trophy" size={16} color="#f59e0b" />
          <Text style={styles.caption}>Лучший</Text>
        </View>
        <Text style={styles.value}>{best}</Text>
        <Text style={styles.unit}>{dayWord(best)}</Text>
      </View>
    </View>
  );
}

function dayWord(n: number): string {
  const m = n % 10;
  const t = n % 100;
  if (t >= 11 && t <= 14) return 'дней';
  if (m === 1) return 'день';
  if (m >= 2 && m <= 4) return 'дня';
  return 'дней';
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  box: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  caption: { fontSize: 12, color: '#64748b' },
  value: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  unit: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
