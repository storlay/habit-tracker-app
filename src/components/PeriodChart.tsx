import { matchFont } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bar, CartesianChart, Line } from 'victory-native';
import { useTheme } from '../context/SettingsContext';
import type { Entry, Habit } from '../types';
import { aggregate, type Period } from '../utils/stats';

const PERIODS: Period[] = ['7d', '30d', '90d', '1y'];

const font = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) ?? 'Helvetica',
  fontSize: 10,
});

type Props = {
  habit: Habit;
  entries: Record<string, Entry>;
  period: Period;
  onChangePeriod: (p: Period) => void;
};

export function PeriodChart({ habit, entries, period, onChangePeriod }: Props) {
  const { colors } = useTheme();
  const data = useMemo(
    () => aggregate(habit, entries, period).map((b, i) => ({ i, value: b.value, label: b.label })),
    [habit, entries, period],
  );

  const isLine = habit.type !== 'binary';
  const hasAny = data.some((d) => d.value > 0);

  return (
    <View>
      <View style={styles.chips}>
        {PERIODS.map((p) => {
          const active = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => onChangePeriod(p)}
              style={[
                styles.chip,
                { backgroundColor: active ? habit.color : colors.surfaceAlt },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#fff' : colors.textSecondary },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chartBox}>
        {hasAny ? (
          <CartesianChart
            data={data}
            xKey="i"
            yKeys={['value']}
            domainPadding={{ left: 16, right: 16, top: 12 }}
            axisOptions={{
              font,
              lineColor: colors.border,
              labelColor: colors.textSecondary,
              formatXLabel: (i) => data[i as number]?.label ?? '',
            }}
          >
            {({ points, chartBounds }) =>
              isLine ? (
                <Line points={points.value} color={habit.color} strokeWidth={2} />
              ) : (
                <Bar
                  points={points.value}
                  chartBounds={chartBounds}
                  color={habit.color}
                  roundedCorners={{ topLeft: 4, topRight: 4 }}
                />
              )
            }
          </CartesianChart>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            За этот период нет данных
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  chartBox: { height: 200 },
  empty: { textAlign: 'center', marginTop: 64 },
});
