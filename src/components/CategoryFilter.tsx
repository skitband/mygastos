import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  const { colors: tc } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.chip, { borderColor: tc.border, backgroundColor: tc.card }, !selectedCategory && { backgroundColor: tc.text, borderColor: tc.text }]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, { color: tc.text }, !selectedCategory && { color: tc.background }]}>All</Text>
      </TouchableOpacity>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.chip,
            { borderColor: tc.border, backgroundColor: tc.card },
            selectedCategory === cat.id && { backgroundColor: tc.text, borderColor: tc.text },
          ]}
          onPress={() => onSelect(selectedCategory === cat.id ? null : cat.id)}
        >
          <Text style={[
            styles.chipText,
            { color: tc.text },
            selectedCategory === cat.id && { color: tc.background },
          ]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.dark,
  },
  chipTextActive: {
    color: colors.white,
  },
});
