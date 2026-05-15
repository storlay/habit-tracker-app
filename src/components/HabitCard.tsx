import { Ionicons } from '@expo/vector-icons';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { Entry, Habit } from '../types';

type Props = {
  habit: Habit;
  entry: Entry | undefined;
  onSetValue: (value: number) => void;
  onEdit: () => void;
  onArchive: () => void;
};

export function HabitCard(props: Props) {
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={() => (
        <RightActions onEdit={props.onEdit} onArchive={props.onArchive} />
      )}
      containerStyle={styles.swipeWrap}
    >
      <CardBody habit={props.habit} entry={props.entry} onSetValue={props.onSetValue} />
    </ReanimatedSwipeable>
  );
}

type BodyProps = Pick<Props, 'habit' | 'entry' | 'onSetValue'>;

function CardBody({ habit, entry, onSetValue }: BodyProps) {
  const value = entry?.value ?? 0;
  const done = entry?.completed ?? false;
  const target = habit.target ?? 1;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: habit.color + '22' }]}>
        <Ionicons name={habit.icon} size={22} color={habit.color} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {habit.title}
        </Text>
        {habit.type !== 'binary' ? (
          <ProgressBar value={value} target={target} color={habit.color} unit={habit.unit} />
        ) : null}
      </View>

      {habit.type === 'binary' ? (
        <BinaryToggle done={done} color={habit.color} onPress={() => onSetValue(done ? 0 : 1)} />
      ) : habit.type === 'counter' ? (
        <CounterControl value={value} color={habit.color} onSetValue={onSetValue} />
      ) : (
        <DurationControl value={value} color={habit.color} onSetValue={onSetValue} />
      )}
    </View>
  );
}

function BinaryToggle({
  done,
  color,
  onPress,
}: {
  done: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.checkBtn,
        { borderColor: color, backgroundColor: done ? color : 'transparent' },
      ]}
      hitSlop={8}
    >
      {done ? <Ionicons name="checkmark" size={22} color="#fff" /> : null}
    </Pressable>
  );
}

function CounterControl({
  value,
  color,
  onSetValue,
}: {
  value: number;
  color: string;
  onSetValue: (v: number) => void;
}) {
  return (
    <View style={styles.counterRow}>
      <Pressable
        onPress={() => onSetValue(value - 1)}
        onLongPress={() => onSetValue(value - 5)}
        style={[styles.stepBtn, { borderColor: color }]}
        hitSlop={6}
      >
        <Ionicons name="remove" size={18} color={color} />
      </Pressable>
      <Text style={styles.counterValue}>{value}</Text>
      <Pressable
        onPress={() => onSetValue(value + 1)}
        onLongPress={() => onSetValue(value + 5)}
        style={[styles.stepBtn, { backgroundColor: color }]}
        hitSlop={6}
      >
        <Ionicons name="add" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

function DurationControl({
  value,
  color,
  onSetValue,
}: {
  value: number;
  color: string;
  onSetValue: (v: number) => void;
}) {
  const [runningSince, setRunningSince] = useState<number | null>(null);
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (runningSince === null) return;
    tickRef.current = setInterval(tick, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [runningSince]);

  const liveMinutes = runningSince !== null ? (Date.now() - runningSince) / 60000 : 0;
  const displayMinutes = Math.floor(value + liveMinutes);

  const onPress = () => {
    if (runningSince === null) {
      setRunningSince(Date.now());
    } else {
      const elapsed = (Date.now() - runningSince) / 60000;
      setRunningSince(null);
      onSetValue(Math.round((value + elapsed) * 10) / 10);
    }
  };

  const running = runningSince !== null;
  return (
    <View style={styles.counterRow}>
      <Text style={styles.counterValue}>{displayMinutes}</Text>
      <Pressable
        onPress={onPress}
        style={[styles.stepBtn, { backgroundColor: running ? '#ef4444' : color }]}
        hitSlop={6}
      >
        <Ionicons name={running ? 'stop' : 'play'} size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

function ProgressBar({
  value,
  target,
  color,
  unit,
}: {
  value: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / target));
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressText}>
        {Math.floor(value)} / {target}
        {unit ? ` ${unit}` : ''}
      </Text>
    </View>
  );
}

function RightActions({
  onEdit,
  onArchive,
}: {
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable onPress={onEdit} style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}>
        <Ionicons name="pencil" size={20} color="#fff" />
      </Pressable>
      <Pressable onPress={onArchive} style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}>
        <Ionicons name="archive" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrap: { borderRadius: 12, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
  titleDone: { color: '#94a3b8', textDecorationLine: 'line-through' },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  progressWrap: { gap: 2 },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, color: '#64748b' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    width: 56,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
