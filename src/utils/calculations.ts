import { DayRecord, OverallSummary, RangeTotals, StreakResult } from '../types/tracker';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatLocalDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function parseLocalDateParts(dateStr: string): { year: number; monthIndex: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

export function getTodayStr(): string {
  const now = new Date();
  return formatLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDaysToDateStr(dateStr: string, deltaDays: number): string {
  const { year, monthIndex, day } = parseLocalDateParts(dateStr);
  const dt = new Date(year, monthIndex, day + deltaDays);
  return formatLocalDate(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Returns Monday = 1 ... Sunday = 7 (matching java.time.DayOfWeek.value)
 */
export function getIsoWeekday(year: number, monthIndex: number, day: number): number {
  const jsDay = new Date(year, monthIndex, day).getDay(); // 0 = Sun ... 6 = Sat
  return jsDay === 0 ? 7 : jsDay;
}

export function formatMonthYear(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

export function formatReadableDate(dateStr: string): string {
  const { year, monthIndex, day } = parseLocalDateParts(dateStr);
  const dt = new Date(year, monthIndex, day);
  const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' });
  return `${weekday}, ${SHORT_MONTH_NAMES[monthIndex]} ${day}, ${year}`;
}

export function formatShortDate(dateStr: string): string {
  const { year, monthIndex, day } = parseLocalDateParts(dateStr);
  return `${SHORT_MONTH_NAMES[monthIndex]} ${day}, ${year}`;
}

export function getRecordTalkSeconds(record?: DayRecord | null): number {
  if (!record) return 0;
  return (
    Math.max(0, record.talkHours || 0) * 3600 +
    Math.max(0, record.talkMinutes || 0) * 60 +
    Math.max(0, record.talkSeconds || 0)
  );
}

export function formatDurationSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}h ${pad2(minutes)}m ${pad2(seconds)}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${pad2(seconds)}s`;
  }
  return `${seconds}s`;
}

export function calculateStreaks(records: DayRecord[], referenceTodayStr = getTodayStr()): StreakResult {
  const recordMap = new Map<string, DayRecord>();
  for (const r of records) {
    recordMap.set(r.date, r);
  }

  const { year, monthIndex, day } = parseLocalDateParts(referenceTodayStr);
  const twoYearsAgoDt = new Date(year - 2, monthIndex, day);
  const cutoffStr = formatLocalDate(
    twoYearsAgoDt.getFullYear(),
    twoYearsAgoDt.getMonth(),
    twoYearsAgoDt.getDate()
  );

  let daysSinceTalking = 0;
  let daysSinceNotTalking = 0;
  let daysSinceMeeting = 0;
  let daysSinceNotMeeting = 0;

  let foundTalking = false;
  let foundNotTalking = false;
  let foundMeeting = false;
  let foundNotMeeting = false;

  let lastTalkingDate: string | null = null;
  let lastNotTalkingDate: string | null = null;
  let lastMeetingDate: string | null = null;
  let lastNotMeetingDate: string | null = null;

  let curr = addDaysToDateStr(referenceTodayStr, -1);

  while (curr > cutoffStr) {
    const rec = recordMap.get(curr);

    if (!foundTalking) {
      if (rec?.talkingStatus === 'TALKING') {
        foundTalking = true;
        lastTalkingDate = curr;
      } else {
        daysSinceTalking++;
      }
    }

    if (!foundNotTalking) {
      if (rec?.talkingStatus === 'NOT_TALKING') {
        foundNotTalking = true;
        lastNotTalkingDate = curr;
      } else {
        daysSinceNotTalking++;
      }
    }

    if (!foundMeeting) {
      if (rec?.meetingStatus === 'MET') {
        foundMeeting = true;
        lastMeetingDate = curr;
      } else {
        daysSinceMeeting++;
      }
    }

    if (!foundNotMeeting) {
      if (rec?.meetingStatus === 'NOT_MET') {
        foundNotMeeting = true;
        lastNotMeetingDate = curr;
      } else {
        daysSinceNotMeeting++;
      }
    }

    if (foundTalking && foundNotTalking && foundMeeting && foundNotMeeting) {
      break;
    }

    curr = addDaysToDateStr(curr, -1);
  }

  return {
    daysSinceTalking,
    daysSinceNotTalking,
    daysSinceMeeting,
    daysSinceNotMeeting,
    foundTalking,
    foundNotTalking,
    foundMeeting,
    foundNotMeeting,
    lastTalkingDate,
    lastNotTalkingDate,
    lastMeetingDate,
    lastNotMeetingDate,
  };
}

export function calculateRangeTotals(
  records: DayRecord[],
  rawStartDate: string,
  rawEndDate: string
): RangeTotals {
  const startDate = rawStartDate <= rawEndDate ? rawStartDate : rawEndDate;
  const endDate = rawStartDate <= rawEndDate ? rawEndDate : rawStartDate;

  const recordMap = new Map<string, DayRecord>();
  for (const r of records) {
    recordMap.set(r.date, r);
  }

  let totalDays = 0;
  let talkingDays = 0;
  let notTalkingDays = 0;
  let meetingDays = 0;
  let notMeetingDays = 0;
  let totalTalkSeconds = 0;
  let notedDays = 0;

  let curr = startDate;
  while (curr <= endDate) {
    totalDays++;
    const rec = recordMap.get(curr);
    if (rec) {
      if (rec.talkingStatus === 'TALKING') talkingDays++;
      if (rec.talkingStatus === 'NOT_TALKING') notTalkingDays++;
      if (rec.meetingStatus === 'MET') meetingDays++;
      if (rec.meetingStatus === 'NOT_MET') notMeetingDays++;
      totalTalkSeconds += getRecordTalkSeconds(rec);
      if (rec.note && rec.note.trim().length > 0) notedDays++;
    }
    curr = addDaysToDateStr(curr, 1);
  }

  return {
    startDate,
    endDate,
    totalDays,
    talkingDays,
    notTalkingDays,
    meetingDays,
    notMeetingDays,
    totalTalkSeconds,
    notedDays,
  };
}

export function calculateOverallSummary(records: DayRecord[]): OverallSummary {
  let talkingDays = 0;
  let notTalkingDays = 0;
  let meetingDays = 0;
  let notMeetingDays = 0;
  let totalTalkSeconds = 0;
  let notedDays = 0;
  let totalLoggedDays = 0;

  for (const rec of records) {
    const secs = getRecordTalkSeconds(rec);
    const hasNote = Boolean(rec.note && rec.note.trim().length > 0);
    const hasAny = rec.talkingStatus !== null || rec.meetingStatus !== null || secs > 0 || hasNote;
    if (!hasAny) continue;

    totalLoggedDays++;
    if (rec.talkingStatus === 'TALKING') talkingDays++;
    if (rec.talkingStatus === 'NOT_TALKING') notTalkingDays++;
    if (rec.meetingStatus === 'MET') meetingDays++;
    if (rec.meetingStatus === 'NOT_MET') notMeetingDays++;
    totalTalkSeconds += secs;
    if (hasNote) notedDays++;
  }

  return {
    totalLoggedDays,
    talkingDays,
    notTalkingDays,
    meetingDays,
    notMeetingDays,
    totalTalkSeconds,
    notedDays,
  };
}
