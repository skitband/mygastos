import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { Expense, Category } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

function SwipeableExpenseItem({
  expense,
  category,
  onDelete,
  onEdit,
  formatAmount,
  themeColors,
}: {
  expense: Expense;
  category: Category | undefined;
  onDelete: () => void;
  onEdit?: () => void;
  formatAmount: (n: number) => string;
  themeColors: any;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateEdit = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [150, 0],
    });
    const translateDelete = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [75, 0],
    });

    return (
      <View style={swipeStyles.actionsContainer}>
        {onEdit && (
          <Animated.View style={{ transform: [{ translateX: translateEdit }] }}>
            <TouchableOpacity
              style={[swipeStyles.actionBtn, swipeStyles.editBtn]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit();
              }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              <Text style={swipeStyles.actionText}>Edit</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        <Animated.View style={{ transform: [{ translateX: translateDelete }] }}>
          <TouchableOpacity
            style={[swipeStyles.actionBtn, swipeStyles.deleteBtn]}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
            <Text style={swipeStyles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={[styles.itemInner, { backgroundColor: themeColors.background }]}>
        <View style={[styles.iconContainer, { backgroundColor: themeColors.lightBg }]}>
          <MaterialCommunityIcons
            name={category?.icon as any || 'help-circle'}
            size={22}
            color={themeColors.text}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.note, { color: themeColors.text }]}>{expense.note}</Text>
          <Text style={[styles.category, { color: themeColors.muted }]}>{category?.name || 'Unknown'}</Text>
        </View>
        <Text style={[styles.amount, { color: themeColors.text }]}>-{formatAmount(expense.amount)}</Text>
      </View>
    </Swipeable>
  );
}

export function ExpenseList({ expenses, categories, onDelete, onEdit }: ExpenseListProps) {
  const { formatAmount } = useCurrency();
  const { colors: themeColors } = useTheme();

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.muted} />
        <Text style={styles.emptyText}>No expenses for this day</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {expenses.map(expense => {
        const category = categories.find(c => c.id === expense.category);
        return (
          <SwipeableExpenseItem
            key={expense.id}
            expense={expense}
            category={category}
            onDelete={() => onDelete(expense.id)}
            onEdit={onEdit ? () => onEdit(expense) : undefined}
            formatAmount={formatAmount}
            themeColors={themeColors}
          />
        );
      })}
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    height: '100%',
    gap: 4,
  },
  editBtn: {
    backgroundColor: '#056DFF',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },
});

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  note: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.dark,
  },
  category: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: colors.muted,
    marginTop: 3,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: colors.dark,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: colors.muted,
  },
});
