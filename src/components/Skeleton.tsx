import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function SkeletonBlock({ width, height, borderRadius = 8, style }: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const { colors, isDark } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const bgColor = isDark ? '#2a2d3a' : '#e8e8e8';

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: bgColor, opacity },
        style,
      ]}
    />
  );
}

export function HomeSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBlock width={140} height={28} borderRadius={6} />
        <SkeletonBlock width={28} height={28} borderRadius={14} />
      </View>

      {/* Blue card */}
      <View style={styles.blueCard}>
        <View style={styles.monthNavSkeleton}>
          <SkeletonBlock width={36} height={36} borderRadius={18} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <SkeletonBlock width={130} height={18} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <SkeletonBlock width={36} height={36} borderRadius={18} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </View>
        <SkeletonBlock width={180} height={14} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 16 }} />
        <SkeletonBlock width={160} height={38} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8 }} />
      </View>

      {/* Category chips */}
      <View style={styles.chips}>
        <SkeletonBlock width={60} height={34} borderRadius={17} />
        <SkeletonBlock width={80} height={34} borderRadius={17} />
        <SkeletonBlock width={70} height={34} borderRadius={17} />
        <SkeletonBlock width={90} height={34} borderRadius={17} />
      </View>

      {/* Calendar placeholder */}
      <View style={[styles.calendarSkeleton, { backgroundColor: colors.surfaceBg }]}>
        <View style={styles.calendarRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} width={30} height={12} borderRadius={4} />
          ))}
        </View>
        {Array.from({ length: 5 }).map((_, row) => (
          <View key={row} style={styles.calendarRow}>
            {Array.from({ length: 7 }).map((_, col) => (
              <SkeletonBlock key={col} width={30} height={30} borderRadius={15} />
            ))}
          </View>
        ))}
      </View>

      {/* Expense items */}
      <View style={styles.expenseItems}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.expenseRow}>
            <SkeletonBlock width={40} height={40} borderRadius={12} />
            <View style={styles.expenseText}>
              <SkeletonBlock width={120} height={14} borderRadius={4} />
              <SkeletonBlock width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
            <SkeletonBlock width={70} height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  blueCard: {
    marginHorizontal: 22,
    backgroundColor: '#056DFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthNavSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  chips: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 10,
    marginBottom: 16,
  },
  calendarSkeleton: {
    marginHorizontal: 22,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 16,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  expenseItems: {
    paddingHorizontal: 22,
    gap: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseText: {
    flex: 1,
  },
});
