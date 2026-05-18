import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { withAlpha } from '../utils/color';

type Props = {
  current: number;
  best: number;
  color: string;
};

export function StreakBadge({ current, best, color }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.box,
          { borderColor: withAlpha(color, 0.33), backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.head}>
          <Ionicons name="flame" size={16} color={color} />
          <Text style={[styles.caption, { color: colors.textSecondary }]}>Сейчас</Text>
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{current}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{dayWord(current)}</Text>
      </View>
      <View
        style={[
          styles.box,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.head}>
          <Ionicons name="trophy" size={16} color={colors.warning} />
          <Text style={[styles.caption, { color: colors.textSecondary }]}>Лучший</Text>
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{best}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{dayWord(best)}</Text>
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
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  caption: { fontSize: 12 },
  value: { fontSize: 26, fontWeight: '700' },
  unit: { fontSize: 12, marginTop: 2 },
});
