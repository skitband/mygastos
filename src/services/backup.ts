import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Category, Expense } from '../types';

const BACKUP_APP_ID = 'gastos';
const BACKUP_VERSION = 1;

interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  expenses: Expense[];
  categories?: Category[];
}

export interface BackupData {
  expenses: Expense[];
  categories?: Category[];
}

function backupFileName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `gastos-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.json`;
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.amount === 'number' && Number.isFinite(e.amount) &&
    typeof e.category === 'string' &&
    typeof e.note === 'string' &&
    typeof e.date === 'string' && !Number.isNaN(Date.parse(e.date))
  );
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.icon === 'string' &&
    typeof c.color === 'string'
  );
}

export async function exportBackup(data: BackupData): Promise<void> {
  const payload: BackupFile = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    expenses: data.expenses,
    categories: data.categories,
  };
  const json = JSON.stringify(payload, null, 2);
  const name = backupFileName();

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Gastos backup',
    UTI: 'public.json',
  });
}

/** Returns null if the user cancelled the picker. */
export async function pickBackup(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const text = Platform.OS === 'web' && asset.file
    ? await asset.file.text()
    : await new File(asset.uri).text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Selected file is not valid JSON.');
  }

  const backup = data as Partial<BackupFile>;
  if (backup?.app !== BACKUP_APP_ID || !Array.isArray(backup.expenses)) {
    throw new Error('Selected file is not a Gastos backup.');
  }
  if ((backup.version ?? 0) > BACKUP_VERSION) {
    throw new Error('This backup was created by a newer version of the app.');
  }
  if (!backup.expenses.every(isExpense)) {
    throw new Error('Backup contains invalid expense records.');
  }
  if (backup.categories !== undefined) {
    if (!Array.isArray(backup.categories) || backup.categories.length === 0 || !backup.categories.every(isCategory)) {
      throw new Error('Backup contains invalid category records.');
    }
  }
  return { expenses: backup.expenses, categories: backup.categories };
}
