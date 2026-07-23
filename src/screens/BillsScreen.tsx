import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

interface MeterData {
  prev: string;
  curr: string;
  rate: string;
  history: MeterHistory[];
}

interface MeterHistory {
  date: string;
  prev: number;
  curr: number;
  cons: number;
  rate: number;
  amount: number;
}

interface Meters {
  elec: MeterData;
  water: MeterData;
}

const INITIAL_METERS: Meters = {
  elec: {
    prev: '0',
    curr: '0',
    rate: '16.00',
    history: [],
  },
  water: {
    prev: '0',
    curr: '0',
    rate: '59.00',
    history: [],
  },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function BillsScreen() {
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [meters, setMeters] = useState<Meters>(INITIAL_METERS);

  const now = new Date();
  const monthShort = MONTHS[now.getMonth()].slice(0, 3);

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

  const saveReading = (util: keyof Meters, unit: string) => {
    setMeters(prev => {
      const mv = prev[util];
      const cons = Math.max(num(mv.curr) - num(mv.prev), 0);
      if (cons <= 0) return prev;
      const amount = cons * num(mv.rate);
      const date = MONTHS[now.getMonth()] + ' ' + now.getFullYear();
      const entry: MeterHistory = {
        date,
        prev: num(mv.prev),
        curr: num(mv.curr),
        cons,
        rate: num(mv.rate),
        amount,
      };
      return {
        ...prev,
        [util]: {
          ...mv,
          prev: mv.curr,
          history: [entry, ...(mv.history || [])],
        },
      };
    });
  };

  const total = meters.elec.history.reduce((s, h) => s + h.amount, 0)
    + meters.water.history.reduce((s, h) => s + h.amount, 0);

  const meterDefs = [
    { id: 'elec' as const, name: 'Electricity', unit: 'kWh', icon: 'flash' as const, color: '#FF6424' },
    { id: 'water' as const, name: 'Water', unit: 'cu.m', icon: 'water' as const, color: '#056DFF' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>Sub-meter</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
        <Text style={styles.summarySubtext}>Electricity + Water for {monthShort}</Text>
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
              onPress={() => saveReading(md.id, md.unit)}
            >
              <Text style={[styles.saveBtnText, { color: colors.text }]}>Save reading</Text>
            </TouchableOpacity>

            {/* History */}
            {mv.history.length > 0 && (
              <>
                <Text style={[styles.historyHead, { color: colors.muted }]}>History</Text>
                {mv.history.map((h, i) => (
                  <View key={i} style={[styles.historyRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyDate, { color: colors.text }]}>{h.date}</Text>
                      <Text style={[styles.historyMeta, { color: colors.muted }]}>
                        {h.cons.toLocaleString('en-US', { maximumFractionDigits: 2 })} {md.unit}
                      </Text>
                      <Text style={[styles.historyMeta, { color: colors.muted }]}>
                        Prev {h.prev} → {h.curr} · {formatAmount(h.rate)}/{md.unit}
                      </Text>
                    </View>
                    <Text style={[styles.historyAmount, { color: colors.text }]}>{formatAmount(h.amount)}</Text>
                  </View>
                ))}
              </>
            )}
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
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  summaryAmount: {
    fontSize: 38,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
    letterSpacing: -1,
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: 'rgba(255,255,255,0.8)',
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
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  historyHead: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 6,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  historyDate: {
    fontSize: 13.5,
    fontFamily: 'Manrope_600SemiBold',
  },
  historyMeta: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
});
