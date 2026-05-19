import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useSettings, useTheme } from '../context/SettingsContext';
import { tx, useT } from '../i18n/useT';
import type { Entry, Habit } from '../types';
import { withAlpha } from '../utils/color';
import { addDaysISO, monthShort, subDaysISO, todayISO, weekdayIndex, type ISODate } from '../utils/date';
import { intensityLevel } from '../utils/stats';

const WEEKS = 53;
const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_LABEL_W = 22;
const TOP_LABEL_H = 16;

type Props = {
  habit: Habit;
  entries: Record<string, Entry>;
};

type Cell = { date: ISODate; week: number; row: number; level: 0 | 1 | 2 | 3 | 4 };

export function Heatmap({ habit, entries }: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { t, i18n } = useT();
  const weekStartsOn = settings.weekStartsOn;
  const [selected, setSelected] = useState<Cell | null>(null);

  const { cells, monthLabels } = useMemo(() => {
    const today = todayISO();
    const offsetIntoCol = (weekdayIndex(today) - weekStartsOn + 7) % 7;
    const oldestStart = subDaysISO(today, (WEEKS - 1) * 7 + offsetIntoCol);
    const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);

    const cs: Cell[] = [];
    const labels: { week: number; label: string }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      const firstDayOfCol = addDaysISO(oldestStart, week * 7);
      const month = Number(firstDayOfCol.slice(5, 7)) - 1;
      if (month !== lastMonth) {
        labels.push({ week, label: monthShort(firstDayOfCol) });
        lastMonth = month;
      }
      for (let row = 0; row < 7; row++) {
        const date = addDaysISO(oldestStart, week * 7 + row);
        if (date > today) continue;
        const value = entries[date]?.value ?? 0;
        cs.push({ date, week, row, level: intensityLevel(value, target) });
      }
    }
    return { cells: cs, monthLabels: labels };
  }, [habit.type, habit.target, entries, weekStartsOn, i18n.language]);

  const rowLabels = Array.from({ length: 7 }, (_, row) => {
    const dow = (row + weekStartsOn) % 7;
    return dow === 1 || dow === 3 || dow === 5 ? tx(t, `common:weekdaysShort.${dow}`) : '';
  });

  const gridW = WEEKS * STEP;
  const gridH = 7 * STEP;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={LEFT_LABEL_W + gridW} height={TOP_LABEL_H + gridH}>
          {monthLabels.map((m) =>
            m.week + 1 < WEEKS ? (
              <SvgText
                key={`m-${m.week}`}
                x={LEFT_LABEL_W + m.week * STEP}
                y={TOP_LABEL_H - 4}
                fontSize={10}
                fill={colors.textSecondary}
              >
                {m.label}
              </SvgText>
            ) : null,
          )}
          {rowLabels.map((label, row) =>
            label ? (
              <SvgText
                key={`r-${row}`}
                x={0}
                y={TOP_LABEL_H + row * STEP + CELL - 2}
                fontSize={10}
                fill={colors.textSecondary}
              >
                {label}
              </SvgText>
            ) : null,
          )}
          {cells.map((c) => (
            <Rect
              key={c.date}
              x={LEFT_LABEL_W + c.week * STEP}
              y={TOP_LABEL_H + c.row * STEP}
              width={CELL}
              height={CELL}
              rx={2}
              fill={fillFor(c.level, habit.color, colors.trackBg)}
              stroke={selected?.date === c.date ? colors.text : 'transparent'}
              strokeWidth={1.5}
              onPress={() => setSelected(c)}
            />
          ))}
        </Svg>
      </ScrollView>
      <Tooltip selected={selected} entries={entries} habit={habit} />
    </View>
  );
}

function fillFor(level: 0 | 1 | 2 | 3 | 4, color: string, empty: string): string {
  if (level === 0) return empty;
  return withAlpha(color, level / 4);
}

function Tooltip({
  selected,
  entries,
  habit,
}: {
  selected: Cell | null;
  entries: Record<string, Entry>;
  habit: Habit;
}) {
  const { colors } = useTheme();
  const { t } = useT();
  if (!selected) {
    return (
      <Text style={[styles.tooltipHint, { color: colors.textMuted }]}>
        {t('stats:tooltipHint')}
      </Text>
    );
  }
  const e = entries[selected.date];
  const value = e?.value ?? 0;
  const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);
  const valueLabel =
    habit.type === 'binary'
      ? value > 0
        ? t('stats:binaryDone')
        : t('stats:binaryNone')
      : `${value}/${target}${habit.unit ? ' ' + habit.unit : ''}`;
  return (
    <Text style={[styles.tooltip, { color: colors.text }]}>
      {selected.date} — {valueLabel}
    </Text>
  );
}

const styles = StyleSheet.create({
  tooltip: { marginTop: 8, fontSize: 13 },
  tooltipHint: { marginTop: 8, fontSize: 12 },
});
