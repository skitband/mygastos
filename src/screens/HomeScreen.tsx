import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as staticColors } from '../theme';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Expense } from '../types';
import { Calendar } from '../components/Calendar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ExpenseList } from '../components/ExpenseList';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { ExpenseDetailSheet } from '../components/ExpenseDetailSheet';
import { HomeSkeleton } from '../components/Skeleton';
import { BillsScreen } from './BillsScreen';
import { SettingsScreen } from './SettingsScreen';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type TabId = 'home' | 'bills' | 'settings';

export function HomeScreen() {
  const {
    categories,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByDate,
    getMonthTotal,
    getDaysWithExpenses,
    refreshData,
  } = useExpenses();

  const { formatAmount } = useCurrency();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);

  const monthTotal = useMemo(
    () => getMonthTotal(currentYear, currentMonth, categoryFilter || undefined),
    [currentYear, currentMonth, categoryFilter, getMonthTotal]
  );

  const daysWithExpenses = useMemo(
    () => getDaysWithExpenses(currentYear, currentMonth, categoryFilter || undefined),
    [currentYear, currentMonth, categoryFilter, getDaysWithExpenses]
  );

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const dayExpenses = useMemo(() => {
    if (!selectedDateStr) return [];
    const expenses = getExpensesByDate(selectedDateStr);
    if (categoryFilter) {
      return expenses.filter(e => e.category === categoryFilter);
    }
    return expenses;
  }, [selectedDateStr, categoryFilter, getExpensesByDate]);

  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        deleteExpense(id);
        setDetailExpense(null);
      }
    } else {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { deleteExpense(id); setDetailExpense(null); } },
        ]
      );
    }
  };

  const handleAddExpense = (amount: number, category: string, note: string) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, { amount, category, note });
      setEditingExpense(null);
      setAddModalVisible(false);
      return;
    }
    if (!selectedDateStr) return;
    addExpense({
      amount,
      category,
      note,
      date: selectedDateStr,
    });
    setAddModalVisible(false);
  };

  const handleExpenseTap = (expense: Expense) => {
    setDetailExpense(expense);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  const renderHomeTab = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: colors.text }]}>My Gastos</Text>
      </View>

      {/* Blue Card: Month Nav + Total */}
      <View style={styles.blueCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalLabel}>Total spent in {MONTHS[currentMonth]}</Text>
        <Text style={styles.totalAmount}>{formatAmount(monthTotal)}</Text>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={categoryFilter}
        onSelect={setCategoryFilter}
      />

      {/* Calendar */}
      <View style={[styles.calendarContainer, { backgroundColor: colors.surfaceBg }]}>
        <Calendar
          year={currentYear}
          month={currentMonth}
          selectedDay={selectedDay}
          daysWithExpenses={daysWithExpenses}
          onSelectDay={setSelectedDay}
        />
      </View>

      {/* Day expenses */}
      {selectedDay && (
        <View style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <Text style={[styles.dayTitle, { color: colors.text }]}>
              {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {dayTotal > 0 && (
              <Text style={[styles.dayTotal, { color: colors.primary }]}>{formatAmount(dayTotal)}</Text>
            )}
          </View>
          <ExpenseList
            expenses={dayExpenses}
            categories={categories}
            onDelete={handleDelete}
            onEdit={handleExpenseTap}
          />
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Screen Content */}
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'bills' && <BillsScreen />}
      {activeTab === 'settings' && <SettingsScreen />}

      {/* FAB - only on home tab */}
      {activeTab === 'home' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (!selectedDay) setSelectedDay(today.getDate());
            setEditingExpense(null);
            setAddModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {([
          { id: 'home' as TabId, label: 'Home', icon: 'calendar-month' },
          { id: 'bills' as TabId, label: 'Bills', icon: 'flash' },
          { id: 'settings' as TabId, label: 'Settings', icon: 'cog' },
        ]).map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={23}
                color={active ? colors.primary : colors.muted}
              />
              <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.muted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Modal */}
      <AddExpenseModal
        visible={addModalVisible}
        categories={categories}
        selectedDate={selectedDateStr || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`}
        onClose={() => {
          setAddModalVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleAddExpense}
        editingExpense={editingExpense}
      />

      {/* Detail Sheet */}
      <ExpenseDetailSheet
        expense={detailExpense}
        categories={categories}
        onClose={() => setDetailExpense(null)}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.5,
  },
  blueCard: {
    marginHorizontal: 22,
    backgroundColor: staticColors.primary,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 18,
    shadowColor: '#056DFF',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 34,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 16,
  },
  totalAmount: {
    fontSize: 42,
    fontFamily: 'Manrope_700Bold',
    color: staticColors.white,
    letterSpacing: -1.5,
    marginTop: 4,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: staticColors.white,
    minWidth: 130,
    textAlign: 'center',
  },
  calendarContainer: {
    marginHorizontal: 22,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18,
    marginBottom: 22,
  },
  daySection: {
    paddingTop: 0,
    paddingBottom: 120,
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  dayTotal: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
  },
  fab: {
    position: 'absolute',
    bottom: 104,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: staticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#056DFF',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 26,
    zIndex: 8,
  },
  tabBar: {
    height: 84,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
  },
});
