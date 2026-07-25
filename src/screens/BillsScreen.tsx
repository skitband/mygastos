import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import * as api from '../services/api';

interface MeterData {
  prev: string;
  curr: string;
  rate: string;
}

interface Meters {
  elec: MeterData;
  water: MeterData;
}

const DEFAULT_METERS: Meters = {
  elec: {
    prev: '0',
    curr: '0',
    rate: '16.00',
  },
  water: {
    prev: '0',
    curr: '0',
    rate: '59.00',
  },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function BillsScreen() {
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [meters, setMeters] = useState<Meters>(DEFAULT_METERS);
  const [savedMeters, setSavedMeters] = useState<Meters>(DEFAULT_METERS);
  const [useApi, setUseApi] = useState(false);

  const storageKey = `@gastos_meters_${currentYear}_${currentMonth}`;

  // Load meter data for current month (API first, fallback to AsyncStorage)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.fetchMeters(currentYear, currentMonth);
        if (!cancelled) {
          setMeters(data);
          setSavedMeters(data);
          setUseApi(true);
          await AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => {});
        }
      } catch {
        // API not available, fall back to AsyncStorage
        if (!cancelled) setUseApi(false);
        try {
          const stored = await AsyncStorage.getItem(storageKey);
          if (!cancelled) {
            const data = stored ? JSON.parse(stored) : DEFAULT_METERS;
            setMeters(data);
            setSavedMeters(data);
          }
        } catch {
          if (!cancelled) {
            setMeters(DEFAULT_METERS);
            setSavedMeters(DEFAULT_METERS);
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [currentYear, currentMonth, storageKey]);

  const saveReading = useCallback(async (util: keyof Meters) => {
    const next = { ...savedMeters, [util]: meters[util] };
    if (useApi) {
      try {
        await api.saveMeterReading(util, currentYear, currentMonth, meters[util]);
      } catch {}
    }
    await AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
    setSavedMeters(next);
  }, [storageKey, meters, savedMeters, useApi, currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const setMeterField = (util: keyof Meters, field: 'prev' | 'curr' | 'rate', value: string) => {
    setMeters(prev => ({
      ...prev,
      [util]: { ...prev[util], [field]: value },
    }));
  };

  const elecCons = Math.max(num(savedMeters.elec.curr) - num(savedMeters.elec.prev), 0);
  const waterCons = Math.max(num(savedMeters.water.curr) - num(savedMeters.water.prev), 0);
  const total = (elecCons * num(savedMeters.elec.rate)) + (waterCons * num(savedMeters.water.rate));

  const meterDefs = [
    { id: 'elec' as const, name: 'Electricity', unit: 'kWh', icon: 'flash' as const, color: '#FF6424' },
    { id: 'water' as const, name: 'Water', unit: 'cu.m', icon: 'water' as const, color: '#056DFF' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>Sub-meter</Text>
      </View>

      {/* Month Nav + Total */}
      <View style={styles.summaryCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalLabel}>Electricity + Water</Text>
        <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
      </View>

      {/* Meter Cards */}
      {meterDefs.map(md => {
        const mv = meters[md.id];
        const cons = Math.max(num(mv.curr) - num(mv.prev), 0);
        const rate = num(mv.rate);
        const amount = cons * rate;
        const consLabel = cons.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + md.unit;

        return (
          <View key={md.id} style={[styles.meterCard, { backgroundColor: colors.lightBg }]}>
            {/* Header */}
            <View style={styles.meterHeader}>
              <View style={[styles.meterIconWrap, { backgroundColor: md.color }]}>
                <MaterialCommunityIcons name={md.icon} size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.meterName, { color: colors.text }]}>{md.name}</Text>
                <Text style={[styles.meterMeta, { color: colors.muted }]}>
                  {md.unit} · {formatAmount(rate)}/{md.unit}
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Previous</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
                  value={mv.prev}
                  onChangeText={(v) => setMeterField(md.id, 'prev', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Current</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
                  value={mv.curr}
                  onChangeText={(v) => setMeterField(md.id, 'curr', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Rate</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
                  value={mv.rate}
                  onChangeText={(v) => setMeterField(md.id, 'rate', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Result */}
            <View style={[styles.resultRow, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>Consumption</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{consLabel}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.resultLabel, { color: colors.muted }]}>Amount due</Text>
                <Text style={styles.resultAmount}>{formatAmount(amount)}</Text>
              </View>
            </View>

            <Text style={[styles.formula, { color: colors.muted }]}>
              {consLabel} × {formatAmount(rate)} = {formatAmount(amount)}
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.surfaceBg }]}
              onPress={() => saveReading(md.id)}
            >
              <Text style={[styles.saveBtnText, { color: colors.text }]}>Save reading</Text>
            </TouchableOpacity>
          </View>
        );
      })}

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
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.5,
  },
  summaryCard: {
    backgroundColor: '#056DFF',
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 20,
    shadowColor: '#056DFF',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 34,
    elevation: 8,
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
    color: '#fff',
    minWidth: 130,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 16,
  },
  summaryAmount: {
    fontSize: 38,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
    letterSpacing: -1,
    marginVertical: 4,
  },

  meterCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  meterIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterName: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
  },
  meterMeta: {
    fontSize: 12.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    padding: 10,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  resultLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  resultValue: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    marginTop: 2,
  },
  resultAmount: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
    color: '#056DFF',
  },
  formula: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  saveBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
  },
});
