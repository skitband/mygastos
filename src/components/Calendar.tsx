import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface CalendarProps {
  year: number;
  month: number;
  selectedDay: number | null;
  daysWithExpenses: number[];
  onSelectDay: (day: number) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ year, month, selectedDay, daysWithExpenses, onSelectDay }: CalendarProps) {
  const { colors: tc } = useTheme();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={[styles.weekdayText, { color: tc.muted }]}>{day}</Text>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={dayIndex} style={styles.dayCell} />;
            }

            const isSelected = day === selectedDay;
            const isToday = day === todayDate;
            const hasExpense = daysWithExpenses.includes(day);

            return (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  isToday && !isSelected && styles.todayDay,
                ]}
                onPress={() => onSelectDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: tc.text },
                  isSelected && styles.selectedDayText,
                  isToday && !isSelected && styles.todayDayText,
                ]}>
                  {day}
                </Text>
                {hasExpense && (
                  <View style={[
                    styles.dot,
                    isSelected && styles.dotSelected,
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: colors.muted,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
    color: colors.dark,
  },
  selectedDayText: {
    color: colors.white,
    fontFamily: 'Manrope_700Bold',
  },
  todayDayText: {
    color: colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a0c4ff',
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
});
