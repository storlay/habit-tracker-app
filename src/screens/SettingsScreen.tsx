import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { HABIT_COLORS } from '../constants/colors';
import { HABIT_ICONS, type IoniconName } from '../constants/icons';
import { useHabits } from '../context/HabitsContext';
import { useSettings, useTheme } from '../context/SettingsContext';
import { tx, useT } from '../i18n/useT';
import type { Settings } from '../types';
import { categoryLabel } from '../utils/category';
import { withAlpha } from '../utils/color';
import { exportPayload } from '../utils/exporter';

const THEME_OPTIONS: { value: Settings['theme']; labelKey: string; icon: IoniconName }[] = [
  { value: 'system', labelKey: 'settings:themeSystem', icon: 'phone-portrait-outline' },
  { value: 'light', labelKey: 'settings:themeLight', icon: 'sunny-outline' },
  { value: 'dark', labelKey: 'settings:themeDark', icon: 'moon-outline' },
];

const WEEK_OPTIONS: { value: Settings['weekStartsOn']; labelKey: string }[] = [
  { value: 1, labelKey: 'settings:weekMonday' },
  { value: 0, labelKey: 'settings:weekSunday' },
];

const LANGUAGE_OPTIONS: { value: Settings['language']; labelKey: string }[] = [
  { value: 'system', labelKey: 'settings:languageSystem' },
  { value: 'ru', labelKey: 'settings:languageRu' },
  { value: 'en', labelKey: 'settings:languageEn' },
  { value: 'es', labelKey: 'settings:languageEs' },
  { value: 'de', labelKey: 'settings:languageDe' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, setTheme, setWeekStartsOn, setLanguage } = useSettings();
  const { state } = useHabits();
  const { t } = useT();

  const onExport = async () => {
    try {
      const json = exportPayload({
        habits: state.habits,
        categories: state.categories,
        entries: state.entries,
        settings,
      });
      await Share.share({ message: json });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('settings:exportErrorFallback');
      Alert.alert(t('settings:exportErrorTitle'), msg);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
    >
      <Section title={t('settings:sectionTheme')}>
        <View style={styles.row}>
          {THEME_OPTIONS.map((opt) => {
            const active = settings.theme === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setTheme(opt.value)}
                style={[
                  styles.themeBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  active && { borderColor: colors.primary },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    { color: active ? colors.primary : colors.text },
                  ]}
                >
                  {tx(t, opt.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={t('settings:sectionWeek')}>
        <View style={styles.row}>
          {WEEK_OPTIONS.map((w) => {
            const active = settings.weekStartsOn === w.value;
            return (
              <Pressable
                key={w.value}
                onPress={() => setWeekStartsOn(w.value)}
                style={[
                  styles.weekBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.weekBtnText,
                    { color: active ? '#fff' : colors.text },
                  ]}
                >
                  {tx(t, w.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={t('settings:sectionLanguage')}>
        <View style={styles.row}>
          {LANGUAGE_OPTIONS.map((l) => {
            const active = settings.language === l.value;
            return (
              <Pressable
                key={l.value}
                onPress={() => setLanguage(l.value)}
                style={[
                  styles.weekBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.weekBtnText,
                    { color: active ? '#fff' : colors.text },
                  ]}
                >
                  {tx(t, l.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={t('settings:sectionCategories')}>
        <CategoriesEditor />
      </Section>

      <Section title={t('settings:sectionData')}>
        <Pressable
          onPress={onExport}
          style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Ionicons name="share-outline" size={18} color={colors.text} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>{t('settings:exportJson')}</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function CategoriesEditor() {
  const { colors } = useTheme();
  const { state, addCategory, editCategory, deleteCategory } = useHabits();
  const { t } = useT();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>(HABIT_COLORS[0]);
  const [draftIcon, setDraftIcon] = useState<IoniconName>(HABIT_ICONS[0]);
  const [showForm, setShowForm] = useState(false);

  const beginEdit = (id: string) => {
    const cat = state.categories.find((c) => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setDraftName(categoryLabel(cat, t));
    setDraftColor(cat.color);
    setDraftIcon(cat.icon);
    setShowForm(true);
  };

  const beginAdd = () => {
    setEditingId(null);
    setDraftName('');
    setDraftColor(HABIT_COLORS[0]);
    setDraftIcon(HABIT_ICONS[0]);
    setShowForm(true);
  };

  const onSave = () => {
    const name = draftName.trim();
    if (!name) {
      Alert.alert(t('settings:categoryCheckForm'), t('settings:categoryNameRequired'));
      return;
    }
    if (editingId) {
      editCategory(editingId, { name, nameKey: undefined, color: draftColor, icon: draftIcon });
    } else {
      addCategory({ name, color: draftColor, icon: draftIcon });
    }
    setShowForm(false);
  };

  const onDelete = (id: string) => {
    const used = state.habits.some((h) => h.categoryId === id && !h.archived);
    if (used) {
      Alert.alert(t('settings:categoryDeleteUsedTitle'), t('settings:categoryDeleteUsedBody'));
      return;
    }
    const cat = state.categories.find((c) => c.id === id);
    Alert.alert(t('settings:categoryDeleteConfirm'), cat ? categoryLabel(cat, t) : '', [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('common:delete'), style: 'destructive', onPress: () => deleteCategory(id) },
    ]);
  };

  return (
    <View style={{ gap: 10 }}>
      {state.categories.map((c) => (
        <View
          key={c.id}
          style={[
            styles.catRow,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <View style={[styles.catIcon, { backgroundColor: withAlpha(c.color, 0.13) }]}>
            <Ionicons name={c.icon} size={18} color={c.color} />
          </View>
          <Text style={[styles.catName, { color: colors.text }]}>{categoryLabel(c, t)}</Text>
          <Pressable onPress={() => beginEdit(c.id)} hitSlop={8} style={styles.catAction}>
            <Ionicons name="pencil" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => onDelete(c.id)} hitSlop={8} style={styles.catAction}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      {showForm ? (
        <View
          style={[
            styles.formBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            placeholder={t('settings:categoryNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.bg },
            ]}
            maxLength={30}
          />
          <View style={styles.swatchRow}>
            {HABIT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setDraftColor(c)}
                style={[
                  styles.colorTile,
                  { backgroundColor: c, borderColor: 'transparent' },
                  draftColor === c && { borderColor: colors.text },
                ]}
              />
            ))}
          </View>
          <View style={styles.swatchRow}>
            {HABIT_ICONS.map((name) => (
              <Pressable
                key={name}
                onPress={() => setDraftIcon(name)}
                style={[
                  styles.iconTile,
                  { borderColor: colors.border, backgroundColor: colors.bg },
                  draftIcon === name && { borderColor: draftColor, backgroundColor: withAlpha(draftColor, 0.13) },
                ]}
              >
                <Ionicons
                  name={name}
                  size={20}
                  color={draftIcon === name ? draftColor : colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.formActions}>
            <Pressable
              onPress={() => setShowForm(false)}
              style={[styles.smallBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.smallBtnText, { color: colors.text }]}>{t('common:cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              style={[styles.smallBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.smallBtnText, { color: '#fff' }]}>
                {editingId ? t('settings:categoryEditSave') : t('settings:categoryEditAdd')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={beginAdd}
          style={[styles.addBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="add" size={18} color={colors.text} />
          <Text style={[styles.addBtnText, { color: colors.text }]}>{t('settings:categoryAddBtn')}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 20, paddingBottom: 48 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeBtnText: { fontSize: 14, fontWeight: '500' },
  weekBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  weekBtnText: { fontSize: 14, fontWeight: '500' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: '500' },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { flex: 1, fontSize: 14, fontWeight: '500' },
  catAction: { padding: 6 },
  formBox: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorTile: { width: 32, height: 32, borderRadius: 16, borderWidth: 2 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallBtnText: { fontSize: 14, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 14, fontWeight: '500' },
});
