import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCurrency, CURRENCIES, Currency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { exportBackup, pickBackup, BackupData } from '../services/backup';
import { CategoryEditorModal } from '../components/CategoryEditorModal';
import { Category } from '../types';

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

function confirmAction(title: string, message: string, confirmText: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

export function SettingsScreen() {
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme, colors } = useTheme();
  const { expenses, categories, refreshData, replaceData, addCategory, updateCategory, deleteCategory } = useExpenses();
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openEditor = (category: Category | null) => {
    setEditingCategory(category);
    setEditorVisible(true);
  };

  const handleSaveCategory = (values: Omit<Category, 'id'>) => {
    if (editingCategory) updateCategory(editingCategory.id, values);
    else addCategory(values);
    setEditorVisible(false);
  };

  const handleDeleteCategory = (category: Category) => {
    if (categories.length <= 1) {
      notify('Cannot delete', 'You need at least one category.');
      return;
    }
    const usedBy = expenses.filter(e => e.category === category.id).length;
    confirmAction(
      `Delete "${category.name}"?`,
      usedBy > 0
        ? `${usedBy} expense${usedBy === 1 ? ' uses' : 's use'} this category and will show as "Unknown".`
        : 'This category will be removed.',
      'Delete',
      () => deleteCategory(category.id),
    );
  };

  const handleExport = async () => {
    if (busy) return;
    setBusy('export');
    try {
      await exportBackup({ expenses, categories });
    } catch (error) {
      notify('Export failed', error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  };

  const restore = async (data: BackupData) => {
    await replaceData(data.expenses, data.categories);
    notify('Import complete', `Restored ${data.expenses.length} expense${data.expenses.length === 1 ? '' : 's'}.`);
  };

  const handleImport = async () => {
    if (busy) return;
    setBusy('import');
    try {
      const imported = await pickBackup();
      if (!imported) return;
      confirmAction(
        'Replace current data?',
        `This will replace your ${expenses.length} current expense${expenses.length === 1 ? '' : 's'} with ${imported.expenses.length} from the backup. This cannot be undone.`,
        'Import',
        () => void restore(imported),
      );
    } catch (error) {
      notify('Import failed', error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>APPEARANCE</Text>
      <TouchableOpacity
        style={[styles.themeRow, { backgroundColor: colors.lightBg }]}
        onPress={toggleTheme}
      >
        <View style={styles.themeLeft}>
          <MaterialCommunityIcons
            name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
            size={20}
            color={colors.text}
          />
          <Text style={[styles.themeLabel, { color: colors.text }]}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        <View style={[styles.toggleTrack, { backgroundColor: isDark ? colors.primary : '#cfd3de' }]}>
          <View style={[styles.toggleKnob, { alignSelf: isDark ? 'flex-end' : 'flex-start' }]} />
        </View>
      </TouchableOpacity>

      {/* Currency */}
      <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 24 }]}>CURRENCY</Text>
      <View style={styles.currencyList}>
        {CURRENCIES.map(c => {
          const active = currency.code === c.code;
          return (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyRow, { backgroundColor: active ? colors.primary : colors.lightBg }]}
              onPress={() => setCurrency(c)}
            >
              <Text style={[styles.currencySymbol, { color: active ? '#fff' : colors.text }]}>
                {c.symbol}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.currencyName, { color: active ? '#fff' : colors.text }]}>
                  {c.name}
                </Text>
                <Text style={[styles.currencyCode, { color: active ? 'rgba(255,255,255,0.8)' : colors.muted }]}>
                  {c.code}
                </Text>
              </View>
              {active && (
                <View style={styles.checkCircle}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categories */}
      <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 24 }]}>CATEGORIES</Text>
      <View style={styles.currencyList}>
        {categories.map(cat => (
          <View key={cat.id} style={[styles.currencyRow, { backgroundColor: colors.lightBg }]}>
            <View style={[styles.catCircle, { backgroundColor: cat.color }]}>
              <MaterialCommunityIcons name={cat.icon as any} size={18} color="#fff" />
            </View>
            <Text style={[styles.currencyName, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {cat.name}
            </Text>
            <TouchableOpacity onPress={() => openEditor(cat)} hitSlop={8} accessibilityLabel={`Edit ${cat.name}`}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCategory(cat)} hitSlop={8} accessibilityLabel={`Delete ${cat.name}`}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#E5484D" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.addCategoryBtn, { borderColor: colors.primary }]}
          onPress={() => openEditor(null)}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
          <Text style={[styles.addCategoryText, { color: colors.primary }]}>Add category</Text>
        </TouchableOpacity>
      </View>

      {/* Data */}
      <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 24 }]}>DATA</Text>
      <View style={styles.currencyList}>
        {([
          { key: 'export', icon: 'export-variant', label: 'Export data', hint: 'Save a backup file of your expenses', onPress: handleExport },
          { key: 'import', icon: 'import', label: 'Import data', hint: 'Restore expenses from a backup file', onPress: handleImport },
        ] as const).map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.currencyRow, { backgroundColor: colors.lightBg, opacity: busy && busy !== item.key ? 0.5 : 1 }]}
            onPress={item.onPress}
            disabled={busy !== null}
          >
            <MaterialCommunityIcons name={item.icon} size={22} color={colors.text} style={styles.dataIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.currencyName, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.currencyCode, { color: colors.muted }]}>{item.hint}</Text>
            </View>
            {busy === item.key
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={refreshData}>
        <Text style={styles.resetText}>Reset data</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />

      <CategoryEditorModal
        visible={editorVisible}
        category={editingCategory}
        existingNames={categories.filter(c => c.id !== editingCategory?.id).map(c => c.name)}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveCategory}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeLabel: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  currencyList: {
    gap: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    width: 30,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  currencyCode: {
    fontSize: 12.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  dataIcon: {
    width: 30,
    textAlign: 'center',
  },
  catCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    marginTop: 28,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffd9c7',
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FF6424',
  },
});
