import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense, Category } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface ExpenseDetailSheetProps {
  expense: Expense | null;
  categories: Category[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function ExpenseDetailSheet({ expense, categories, onClose, onDelete }: ExpenseDetailSheetProps) {
  const { formatAmount } = useCurrency();
  const { colors } = useTheme();

  if (!expense) return null;

  const category = categories.find(c => c.id === expense.category);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <Modal visible={!!expense} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.alignBottom}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={e => e.stopPropagation()}>
            <View style={styles.handle} />

            <View style={styles.detailCenter}>
              <View style={[styles.iconWrap, { backgroundColor: colors.lightBg }]}>
                <MaterialCommunityIcons
                  name={category?.icon as any || 'help-circle'}
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>
                -{formatAmount(expense.amount)}
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>{expense.note}</Text>
            </View>

            <View style={[styles.rows, { backgroundColor: colors.lightBg }]}>
              <View style={[styles.row, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rowLabel, { color: colors.muted }]}>Category</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{category?.name || 'Unknown'}</Text>
              </View>
              <View style={styles.rowLast}>
                <Text style={[styles.rowLabel, { color: colors.muted }]}>Date</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{formatDate(expense.date)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(expense.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF6424" />
              <Text style={styles.deleteText}>Delete expense</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,18,43,0.4)',
    justifyContent: 'flex-end',
  },
  alignBottom: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#c9cdda',
    alignSelf: 'center',
    marginBottom: 22,
  },
  detailCenter: {
    alignItems: 'center',
    marginBottom: 26,
  },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 34,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    marginTop: 8,
  },
  rows: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  rowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffd9c7',
    marginTop: 20,
  },
  deleteText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FF6424',
  },
});
