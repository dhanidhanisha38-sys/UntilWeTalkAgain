import { AppThemeMode, DayRecord } from '../types/tracker';
import { addDaysToDateStr, getTodayStr } from './calculations';

const RECORDS_STORAGE_KEY = 'until_we_talk_again_records_v1';
const THEME_STORAGE_KEY = 'until_we_talk_again_theme_v1';

export function loadRecordsFromStorage(): DayRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecord).filter((r): r is DayRecord => r !== null);
  } catch {
    return [];
  }
}

export function saveRecordsToStorage(records: DayRecord[]): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota errors in restricted storage environments
  }
}

export function loadThemeFromStorage(): AppThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (
      raw === 'CLASSIC_INDIGO' ||
      raw === 'INDIGO_DARK' ||
      raw === 'WARM_SUNSET' ||
      raw === 'FOREST_CALM'
    ) {
      return raw;
    }
    return 'CLASSIC_INDIGO';
  } catch {
    return 'CLASSIC_INDIGO';
  }
}

export function saveThemeToStorage(theme: AppThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}

export function normalizeRecord(input: unknown): DayRecord | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.date)) return null;

  const talkingStatus =
    obj.talkingStatus === 'TALKING' || obj.talkingStatus === 'NOT_TALKING'
      ? obj.talkingStatus
      : null;

  const meetingStatus =
    obj.meetingStatus === 'MET' || obj.meetingStatus === 'NOT_MET'
      ? obj.meetingStatus
      : null;

  return {
    date: obj.date,
    talkingStatus,
    meetingStatus,
    note: typeof obj.note === 'string' ? obj.note : '',
    talkHours: typeof obj.talkHours === 'number' && Number.isFinite(obj.talkHours) ? Math.max(0, Math.floor(obj.talkHours)) : 0,
    talkMinutes: typeof obj.talkMinutes === 'number' && Number.isFinite(obj.talkMinutes) ? Math.min(59, Math.max(0, Math.floor(obj.talkMinutes))) : 0,
    talkSeconds: typeof obj.talkSeconds === 'number' && Number.isFinite(obj.talkSeconds) ? Math.min(59, Math.max(0, Math.floor(obj.talkSeconds))) : 0,
  };
}

export function isRecordEmpty(record: DayRecord): boolean {
  return (
    record.talkingStatus === null &&
    record.meetingStatus === null &&
    record.note.trim().length === 0 &&
    record.talkHours === 0 &&
    record.talkMinutes === 0 &&
    record.talkSeconds === 0
  );
}

export function generateSampleMonthRecords(referenceTodayStr = getTodayStr()): DayRecord[] {
  const sampleOffsets: Array<{
    offset: number;
    talkingStatus: DayRecord['talkingStatus'];
    meetingStatus: DayRecord['meetingStatus'];
    hours: number;
    minutes: number;
    seconds: number;
    note: string;
  }> = [
    { offset: -18, talkingStatus: 'TALKING', meetingStatus: 'MET', hours: 1, minutes: 20, seconds: 15, note: 'Coffee catch-up in the afternoon.' },
    { offset: -17, talkingStatus: 'TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 18, seconds: 40, note: 'Quick evening phone call.' },
    { offset: -15, talkingStatus: 'NOT_TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 0, seconds: 0, note: 'Quiet busy day.' },
    { offset: -14, talkingStatus: 'NOT_TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 0, seconds: 0, note: '' },
    { offset: -12, talkingStatus: 'TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 42, seconds: 10, note: 'Long voice note exchange and call.' },
    { offset: -10, talkingStatus: 'TALKING', meetingStatus: 'MET', hours: 2, minutes: 5, seconds: 0, note: 'Walk through the park & dinner.' },
    { offset: -8, talkingStatus: 'NOT_TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 0, seconds: 0, note: 'Taking space before the weekend.' },
    { offset: -6, talkingStatus: 'TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 31, seconds: 25, note: 'Checked in after work.' },
    { offset: -4, talkingStatus: 'TALKING', meetingStatus: 'MET', hours: 1, minutes: 45, seconds: 0, note: 'Met up for lunch.' },
    { offset: -3, talkingStatus: 'TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 24, seconds: 50, note: '' },
    { offset: -2, talkingStatus: 'NOT_TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 0, seconds: 0, note: 'Travel day.' },
    { offset: -1, talkingStatus: 'TALKING', meetingStatus: 'NOT_MET', hours: 0, minutes: 14, seconds: 30, note: 'Late night check-in before sleep.' },
  ];

  return sampleOffsets.map((item) => ({
    date: addDaysToDateStr(referenceTodayStr, item.offset),
    talkingStatus: item.talkingStatus,
    meetingStatus: item.meetingStatus,
    note: item.note,
    talkHours: item.hours,
    talkMinutes: item.minutes,
    talkSeconds: item.seconds,
  }));
}
