import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import type { Entry, Habit } from '../types';
import { addDaysISO, subDaysISO, todayISO, weekdayIndex, type ISODate } from '../utils/date';
import { intensityLevel } from '../utils/stats';

const WEEKS = 53;
const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_LABEL_W = 22;
const TOP_LABEL_H = 16;
const LABEL_COLOR = '#64748b';

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const ROW_LABELS = ['', 'Пн', '', 'Ср', '', 'Пт', ''];

type Props = {
  habit: Habit;
  entries: Record<string, Entry>;
};

type Cell = { date: ISODate; week: number; row: number; level: 0 | 1 | 2 | 3 | 4 };

export function Heatmap({ habit, entries }: Props) {
  const [selected, setSelected] = useState<Cell | null>(null);

  const { cells, monthLabels } = useMemo(() => {
    const today = todayISO();
    const oldestStart = subDaysISO(today, (WEEKS - 1) * 7 + weekdayIndex(today));
    const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);

    const cs: Cell[] = [];
    const labels: { week: number; label: string }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      const firstDayOfCol = addDaysISO(oldestStart, week * 7);
      const month = Number(firstDayOfCol.slice(5, 7)) - 1;
      if (month !== lastMonth) {
        labels.push({ week, label: MONTHS[month] });
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
  }, [habit.type, habit.target, entries]);

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
                fill={LABEL_COLOR}
              >
                {m.label}
              </SvgText>
            ) : null,
          )}
          {ROW_LABELS.map((label, row) =>
            label ? (
              <SvgText
                key={`r-${row}`}
                x={0}
                y={TOP_LABEL_H + row * STEP + CELL - 2}
                fontSize={10}
                fill={LABEL_COLOR}
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
              fill={fillFor(c.level, habit.color)}
              stroke={selected?.date === c.date ? '#0f172a' : 'transparent'}
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

function fillFor(level: 0 | 1 | 2 | 3 | 4, color: string): string {
  if (level === 0) return '#e5e7eb';
  const alpha = { 1: '40', 2: '80', 3: 'bf', 4: 'ff' }[level];
  return color + alpha;
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
  if (!selected) {
    return <Text style={styles.tooltipHint}>Нажмите ячейку, чтобы увидеть детали</Text>;
  }
  const e = entries[selected.date];
  const value = e?.value ?? 0;
  const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);
  const valueLabel =
    habit.type === 'binary'
      ? value > 0
        ? 'выполнено'
        : 'нет'
      : `${value}/${target}${habit.unit ? ' ' + habit.unit : ''}`;
  return (
    <Text style={styles.tooltip}>
      {selected.date} — {valueLabel}
    </Text>
  );
}

const styles = StyleSheet.create({
  tooltip: { marginTop: 8, fontSize: 13, color: '#0f172a' },
  tooltipHint: { marginTop: 8, fontSize: 12, color: '#94a3b8' },
});
