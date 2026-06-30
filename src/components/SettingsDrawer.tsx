import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Switch,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCurrency, CURRENCIES, Currency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme, colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = (c: Currency) => {
    setCurrency(c);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }], backgroundColor: colors.card },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Theme Toggle */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Appearance</Text>
            <View style={[styles.themeRow, { backgroundColor: colors.lightBg }]}>
              <View style={styles.themeInfo}>
                <MaterialCommunityIcons
                  name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.themeName, { color: colors.text }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#ccc', true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Currency */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>Currency</Text>
            {CURRENCIES.map(c => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.currencyOption,
                  { backgroundColor: colors.lightBg },
                  currency.code === c.code && styles.currencyOptionActive,
                ]}
                onPress={() => handleSelect(c)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[
                    styles.currencySymbol,
                    { color: colors.text },
                    currency.code === c.code && styles.currencyTextActive,
                  ]}>{c.symbol}</Text>
                  <View>
                    <Text style={[
                      styles.currencyName,
                      { color: colors.text },
                      currency.code === c.code && styles.currencyTextActive,
                    ]}>{c.name}</Text>
                    <Text style={[
                      styles.currencyCode,
                      { color: colors.muted },
                      currency.code === c.code && styles.currencyCodeActive,
                    ]}>{c.code}</Text>
                  </View>
                </View>
                {currency.code === c.code && (
                  <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  drawerTitle: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
  },
  section: {
    gap: 10,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeName: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  currencyOptionActive: {
    backgroundColor: '#056DFF',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    width: 28,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  currencyCode: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  currencyTextActive: {
    color: '#fff',
  },
  currencyCodeActive: {
    color: 'rgba(255,255,255,0.7)',
  },
});
