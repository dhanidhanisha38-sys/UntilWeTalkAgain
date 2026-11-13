export type TalkingStatus = 'TALKING' | 'NOT_TALKING';
export type MeetingStatus = 'MET' | 'NOT_MET';

export type ActiveTab = 'talking' | 'meeting' | 'dashboard';

export type AppThemeMode =
  | 'CLASSIC_INDIGO'
  | 'INDIGO_DARK'
  | 'WARM_SUNSET'
  | 'FOREST_CALM';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  talkingStatus: TalkingStatus | null;
  meetingStatus: MeetingStatus | null;
  note: string;
  talkHours: number;
  talkMinutes: number;
  talkSeconds: number;
}

export interface StreakResult {
  daysSinceTalking: number;
  daysSinceNotTalking: number;
  daysSinceMeeting: number;
  daysSinceNotMeeting: number;
  foundTalking: boolean;
  foundNotTalking: boolean;
  foundMeeting: boolean;
  foundNotMeeting: boolean;
  lastTalkingDate: string | null;
  lastNotTalkingDate: string | null;
  lastMeetingDate: string | null;
  lastNotMeetingDate: string | null;
}

export interface RangeTotals {
  startDate: string;
  endDate: string;
  totalDays: number;
  talkingDays: number;
  notTalkingDays: number;
  meetingDays: number;
  notMeetingDays: number;
  totalTalkSeconds: number;
  notedDays: number;
}

export interface OverallSummary {
  totalLoggedDays: number;
  talkingDays: number;
  notTalkingDays: number;
  meetingDays: number;
  notMeetingDays: number;
  totalTalkSeconds: number;
  notedDays: number;
}
