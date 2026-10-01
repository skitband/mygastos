import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

export const CATEGORY_ICONS = [
  'silverware-fork-knife', 'cart', 'car', 'gamepad-variant', 'shopping', 'flash', 'heart-pulse',
  'home', 'coffee', 'food-apple', 'bus', 'train', 'airplane', 'gas-station', 'cellphone',
  'wifi', 'water', 'school', 'book-open-variant', 'briefcase', 'gift', 'paw', 'baby-carriage',
  'tshirt-crew', 'dumbbell', 'pill', 'movie-open', 'music', 'beer', 'cash', 'credit-card',
  'bank', 'piggy-bank', 'tools', 'hammer-wrench', 'church', 'hand-heart', 'dots-horizontal',
] as const;

export const CATEGORY_COLORS = [
  '#056DFF', '#0DA678', '#FF6424', '#E5484D', '#8E4EC6', '#D6409F',
  '#F5A524', '#12A594', '#3E63DD', '#6E56CF', '#AD7F58', '#10122B',
];

const MAX_NAME_LENGTH = 24;

interface CategoryEditorModalProps {
  visible: boolean;
  category: Category | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (values: Omit<Category, 'id'>) => void;
}

export function CategoryEditorModal({ visible, category, existingNames, onClose, onSave }: CategoryEditorModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(category?.name ?? '');
    setIcon(category?.icon ?? CATEGORY_ICONS[0]);
    setColor(category?.color ?? CATEGORY_COLORS[0]);
    setError(null);
  }, [visible, category]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }
    const lower = trimmed.toLowerCase();
    if (existingNames.some(n => n.toLowerCase() === lower)) {
      setError('A category with this name already exists.');
      return;
    }
    onSave({ name: trimmed, icon, color });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={[styles.headerBtn, { backgroundColor: colors.lightBg }]}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{category ? 'Edit Category' : 'New Category'}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.preview}>
            <View style={[styles.previewCircle, { backgroundColor: color }]}>
              <MaterialCommunityIcons name={icon as any} size={32} color="#fff" />
            </View>
            <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
              {name.trim() || 'Category name'}
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>NAME</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.lightBg }]}
            placeholder="e.g. Rent"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={text => { setName(text); setError(null); }}
            maxLength={MAX_NAME_LENGTH}
            autoFocus={!category}
            returnKeyType="done"
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={[styles.label, { color: colors.muted, marginTop: 22 }]}>COLOR</Text>
          <View style={styles.grid}>
            {CATEGORY_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.swatch, { backgroundColor: c }, color === c && { borderColor: colors.text }]}
                onPress={() => setColor(c)}
              >
                {color === c && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.muted, marginTop: 22 }]}>ICON</Text>
          <View style={styles.grid}>
            {CATEGORY_ICONS.map(i => {
              const active = icon === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.iconCell, { backgroundColor: active ? color : colors.lightBg }]}
                  onPress={() => setIcon(i)}
                >
                  <MaterialCommunityIcons name={i} size={22} color={active ? '#fff' : colors.muted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{category ? 'Save Changes' : 'Add Category'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  previewCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  error: {
    marginTop: 6,
    fontSize: 12.5,
    fontFamily: 'Manrope_500Medium',
    color: '#E5484D',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    marginHorizontal: 22,
    marginBottom: 32,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#fff',
  },
});
