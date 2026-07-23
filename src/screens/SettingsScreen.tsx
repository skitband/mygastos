import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCurrency, CURRENCIES, Currency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';

export function SettingsScreen() {
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme, colors } = useTheme();
  const { refreshData } = useExpenses();

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

      {/* Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={refreshData}>
        <Text style={styles.resetText}>Reset data</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
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
