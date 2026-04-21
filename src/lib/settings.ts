import fs from 'fs';
import path from 'path';
import os from 'os';

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const SETTINGS_PATH = path.join(localAppData, 'UltimateHumanizer', 'settings.json');

export interface AppSettings {
  DeepSeekApiKey: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  DeepSeekApiKey: '',
};

export function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = loadSettings();
    const merged = { ...current, ...settings };
    fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
