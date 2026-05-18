import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useTheme } from '../context/SettingsContext';
import type { HabitFormProps } from '../navigation/types';
import type { HabitDraft, HabitType } from '../types';
import { withAlpha } from '../utils/color';
import { requestPermissions } from '../utils/notifications';
import { DOW_SHORT } from '../utils/stats';
import { validateDraft } from '../utils/validation';

const TYPE_KEYS: { value: HabitType; labelKey: string }[] = [
  { value: 'binary', labelKey: 'form:typeBinary' },
  { value: 'counter', labelKey: 'form:typeCounter' },
  { value: 'duration', labelKey: 'form:typeDuration' },
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
  const { colors } = useTheme();
  const { t } = useTranslation();
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
        Alert.alert(t('form:noPermissionTitle'), t('form:noPermissionBody'));
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
      Alert.alert(t('form:checkFormTitle'), t('form:selectDay'));
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
      Alert.alert(t('form:checkFormTitle'), t(err));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await editHabit(editing.id, draft);
      } else {
        const id = await addHabit(draft);
        if (!id) {
          Alert.alert(t('form:saveErrorTitle'), t('form:saveErrorBody'));
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
    Alert.alert(t('form:archiveTitle'), editing.title, [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('form:archive'),
        style: 'destructive',
        onPress: () => {
          archiveHabit(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
    >
      <Field label={t('form:fieldTitle')}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('form:placeholderTitle')}
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          maxLength={60}
        />
      </Field>

      <Field label={t('form:fieldType')}>
        <View style={styles.row}>
          {TYPE_KEYS.map((opt) => (
            <Chip
              key={opt.value}
              label={t(opt.labelKey)}
              selected={type === opt.value}
              onPress={() => setType(opt.value)}
            />
          ))}
        </View>
      </Field>

      {type !== 'binary' ? (
        <>
          <Field label={t('form:fieldTarget')}>
            <TextInput
              value={target}
              onChangeText={setTarget}
              placeholder={type === 'counter' ? '8' : '30'}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={inputStyle}
              maxLength={4}
            />
          </Field>
          <Field label={t('form:fieldUnit')}>
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder={type === 'counter' ? t('form:placeholderCounter') : t('form:placeholderDuration')}
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
              maxLength={20}
            />
          </Field>
        </>
      ) : null}

      <Field label={t('form:fieldCategory')}>
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

      <Field label={t('form:fieldColor')}>
        <View style={styles.row}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorTile,
                { backgroundColor: c, borderColor: 'transparent' },
                color === c && { borderColor: colors.text },
              ]}
            />
          ))}
        </View>
      </Field>

      <Field label={t('form:fieldIcon')}>
        <View style={styles.row}>
          {HABIT_ICONS.map((name) => (
            <Pressable
              key={name}
              onPress={() => setIcon(name)}
              style={[
                styles.iconTile,
                { borderColor: colors.border, backgroundColor: colors.surface },
                icon === name && { backgroundColor: withAlpha(color, 0.13), borderColor: color },
              ]}
            >
              <Ionicons
                name={name}
                size={22}
                color={icon === name ? color : colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </Field>

      <Field label={t('form:fieldWeekly', { count: weeklyGoal })}>
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
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('form:fieldReminder')}</Text>
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
                  style={[
                    styles.timeBtn,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.timeBtnText, { color: colors.text }]}>
                    {format(reminderTime, 'HH:mm')}
                  </Text>
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
        <Text style={styles.saveBtnText}>{editing ? t('form:save') : t('form:create')}</Text>
      </Pressable>

      {editing ? (
        <Pressable onPress={onArchive} style={styles.archiveBtn}>
          <Text style={[styles.archiveBtnText, { color: colors.danger }]}>{t('form:archive')}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
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
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: colors.border, backgroundColor: colors.surface },
        selected && { backgroundColor: colors.text, borderColor: colors.text },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.bg : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 48 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
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
  },
  chipText: { fontSize: 14 },
  colorTile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  timeBtnText: { fontSize: 16, fontVariant: ['tabular-nums'] },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  archiveBtn: { paddingVertical: 12, alignItems: 'center' },
  archiveBtnText: { fontSize: 14, fontWeight: '500' },
});
