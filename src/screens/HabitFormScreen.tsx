import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HABIT_COLORS } from '../constants/colors';
import { HABIT_ICONS, type IoniconName } from '../constants/icons';
import { useHabits } from '../context/HabitsContext';
import type { HabitFormProps } from '../navigation/types';
import type { HabitDraft, HabitType } from '../types';
import { requestPermissions } from '../utils/notifications';
import { DOW_SHORT } from '../utils/stats';
import { validateDraft } from '../utils/validation';

const TYPES: { value: HabitType; label: string }[] = [
  { value: 'binary', label: 'Да/нет' },
  { value: 'counter', label: 'Счётчик' },
  { value: 'duration', label: 'Время' },
];

const DAY_OPTIONS: { label: string; value: number }[] = [1, 2, 3, 4, 5, 6, 0].map((v) => ({
  label: DOW_SHORT[v],
  value: v,
}));

function initialTime(reminder: { hour: number; minute: number } | undefined): Date {
  const d = new Date();
  d.setHours(reminder?.hour ?? 9, reminder?.minute ?? 0, 0, 0);
  return d;
}

export default function HabitFormScreen({ route, navigation }: HabitFormProps) {
  const { state, addHabit, editHabit, archiveHabit } = useHabits();
  const editingId = route.params?.habitId;
  const editing = editingId ? state.habits.find((h) => h.id === editingId) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [type, setType] = useState<HabitType>(editing?.type ?? 'binary');
  const [target, setTarget] = useState(String(editing?.target ?? ''));
  const [unit, setUnit] = useState(editing?.unit ?? '');
  const [categoryId, setCategoryId] = useState(
    editing?.categoryId ?? state.categories[0]?.id ?? '',
  );
  const [color, setColor] = useState(editing?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState<IoniconName>(editing?.icon ?? HABIT_ICONS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(editing?.weeklyGoal ?? 7);
  const [reminderEnabled, setReminderEnabled] = useState(!!editing?.reminder);
  const [reminderTime, setReminderTime] = useState<Date>(() => initialTime(editing?.reminder));
  const [reminderDays, setReminderDays] = useState<number[]>(
    editing?.reminder?.days ?? [1, 2, 3, 4, 5],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const onToggleReminder = async (next: boolean) => {
    if (next) {
      const ok = await requestPermissions();
      if (!ok) {
        Alert.alert('Нет разрешения', 'Разрешите уведомления в настройках устройства');
        return;
      }
    }
    setReminderEnabled(next);
  };

  const toggleDay = (n: number) => {
    setReminderDays((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n],
    );
  };

  const onSave = async () => {
    if (reminderEnabled && reminderDays.length === 0) {
      Alert.alert('Проверьте форму', 'Выберите хотя бы один день для напоминания');
      return;
    }
    const parsedTarget = target.trim() ? Number(target) : undefined;
    const reminder = reminderEnabled
      ? {
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          days: [...reminderDays].sort((a, b) => a - b),
        }
      : undefined;
    const draft: HabitDraft = {
      title: title.trim(),
      type,
      target: type === 'binary' ? undefined : parsedTarget,
      unit: type === 'binary' ? undefined : unit.trim() || undefined,
      categoryId,
      color,
      icon,
      weeklyGoal,
      reminder,
    };
    const err = validateDraft(draft);
    if (err) {
      Alert.alert('Проверьте форму', err);
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await editHabit(editing.id, draft);
      } else {
        const id = await addHabit(draft);
        if (!id) {
          Alert.alert('Ошибка', 'Не удалось сохранить');
          return;
        }
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const onArchive = () => {
    if (!editing) return;
    Alert.alert('Архивировать привычку?', editing.title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'В архив',
        style: 'destructive',
        onPress: () => {
          archiveHabit(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Field label="Название">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Например, Пить воду"
          style={styles.input}
          maxLength={60}
        />
      </Field>

      <Field label="Тип">
        <View style={styles.row}>
          {TYPES.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              selected={type === t.value}
              onPress={() => setType(t.value)}
            />
          ))}
        </View>
      </Field>

      {type !== 'binary' ? (
        <>
          <Field label="Цель">
            <TextInput
              value={target}
              onChangeText={setTarget}
              placeholder={type === 'counter' ? '8' : '30'}
              keyboardType="number-pad"
              style={styles.input}
              maxLength={4}
            />
          </Field>
          <Field label="Единица">
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder={type === 'counter' ? 'стаканов' : 'мин'}
              style={styles.input}
              maxLength={20}
            />
          </Field>
        </>
      ) : null}

      <Field label="Категория">
        <View style={styles.row}>
          {state.categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
            />
          ))}
        </View>
      </Field>

      <Field label="Цвет">
        <View style={styles.row}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorTile,
                { backgroundColor: c },
                color === c && styles.colorTileSelected,
              ]}
            />
          ))}
        </View>
      </Field>

      <Field label="Иконка">
        <View style={styles.row}>
          {HABIT_ICONS.map((name) => (
            <Pressable
              key={name}
              onPress={() => setIcon(name)}
              style={[
                styles.iconTile,
                icon === name && { backgroundColor: color + '22', borderColor: color },
              ]}
            >
              <Ionicons
                name={name}
                size={22}
                color={icon === name ? color : '#475569'}
              />
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label={`Дней в неделю: ${weeklyGoal}`}>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Chip
              key={n}
              label={String(n)}
              selected={weeklyGoal === n}
              onPress={() => setWeeklyGoal(n)}
            />
          ))}
        </View>
      </Field>

      <View style={styles.field}>
        <View style={styles.reminderHeader}>
          <Text style={styles.label}>Напоминание</Text>
          <Switch value={reminderEnabled} onValueChange={onToggleReminder} />
        </View>
        {reminderEnabled ? (
          <View style={styles.reminderBody}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                mode="time"
                value={reminderTime}
                onChange={(_, d) => d && setReminderTime(d)}
              />
            ) : (
              <>
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={styles.timeBtn}
                >
                  <Text style={styles.timeBtnText}>{format(reminderTime, 'HH:mm')}</Text>
                </Pressable>
                {showPicker ? (
                  <DateTimePicker
                    mode="time"
                    value={reminderTime}
                    is24Hour
                    onChange={(_, d) => {
                      setShowPicker(false);
                      if (d) setReminderTime(d);
                    }}
                  />
                ) : null}
              </>
            )}
            <View style={styles.row}>
              {DAY_OPTIONS.map((d) => (
                <Chip
                  key={d.value}
                  label={d.label}
                  selected={reminderDays.includes(d.value)}
                  onPress={() => toggleDay(d.value)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onSave}
        disabled={saving}
        style={[styles.saveBtn, { backgroundColor: color, opacity: saving ? 0.6 : 1 }]}
      >
        <Text style={styles.saveBtnText}>{editing ? 'Сохранить' : 'Создать'}</Text>
      </Pressable>

      {editing ? (
        <Pressable onPress={onArchive} style={styles.archiveBtn}>
          <Text style={styles.archiveBtnText}>В архив</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 48 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipText: { fontSize: 14, color: '#0f172a' },
  chipTextSelected: { color: '#fff' },
  colorTile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorTileSelected: { borderColor: '#0f172a' },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderBody: { gap: 12 },
  timeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  timeBtnText: { fontSize: 16, color: '#0f172a', fontVariant: ['tabular-nums'] },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  archiveBtn: { paddingVertical: 12, alignItems: 'center' },
  archiveBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
});
