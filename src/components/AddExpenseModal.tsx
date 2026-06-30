import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import { Category, Expense } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AddExpenseModalProps {
  visible: boolean;
  categories: Category[];
  selectedDate: string;
  onClose: () => void;
  onSave: (amount: number, category: string, note: string) => void;
  editingExpense?: Expense | null;
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export function AddExpenseModal({ visible, categories, selectedDate, onClose, onSave, editingExpense }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [note, setNote] = useState('');
  const { currency } = useCurrency();

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setSelectedCategory(editingExpense.category);
      setNote(editingExpense.note);
    } else {
      setAmount('0');
      setNote('');
      setSelectedCategory(categories[0]?.id || '');
    }
  }, [editingExpense, visible]);

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
    } else {
      if (amount === '0') {
        setAmount(key);
      } else {
        // Limit to 2 decimal places
        const parts = amount.split('.');
        if (parts[1] && parts[1].length >= 2) return;
        setAmount(prev => prev + key);
      }
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && selectedCategory) {
      onSave(numAmount, selectedCategory, note || 'Expense');
      setAmount('0');
      setNote('');
      setSelectedCategory(categories[0]?.id || '');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>New Expense</Text>
          <View style={styles.closeBtn} />
        </View>

        <Text style={styles.dateLabel}>{formatDate(selectedDate)}</Text>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{currency.symbol}{amount}</Text>
        </View>

        {/* Category Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catItem]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={[
                styles.catCircle,
                { backgroundColor: selectedCategory === cat.id ? cat.color : colors.lightBg },
              ]}>
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={22}
                  color={selectedCategory === cat.id ? colors.white : colors.muted}
                />
              </View>
              <Text style={[
                styles.catLabel,
                selectedCategory === cat.id && { color: cat.color, fontFamily: 'Manrope_700Bold' },
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Note Input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYPAD.map(key => (
            <TouchableOpacity
              key={key}
              style={styles.keyBtn}
              onPress={() => handleKeyPress(key)}
            >
              {key === 'del' ? (
                <MaterialCommunityIcons name="backspace-outline" size={24} color={colors.dark} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{editingExpense ? 'Update Expense' : 'Add Expense'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
    color: colors.dark,
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: colors.muted,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  amountText: {
    fontSize: 48,
    fontFamily: 'Manrope_700Bold',
    color: colors.dark,
    letterSpacing: -2,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 12,
  },
  catItem: {
    alignItems: 'center',
    width: 60,
  },
  catCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
    color: colors.muted,
  },
  noteContainer: {
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  noteInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: colors.dark,
    paddingVertical: 10,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 30,
    gap: 8,
    marginTop: 8,
  },
  keyBtn: {
    width: '30%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surfaceBg,
  },
  keyText: {
    fontSize: 22,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.dark,
  },
  saveBtn: {
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 34,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: colors.white,
  },
});
