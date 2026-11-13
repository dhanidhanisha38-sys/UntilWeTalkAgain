import { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Check,
  Clock,
  FileText,
  Handshake,
  MessageCircle,
  Search,
  Sparkles,
  UserX,
  X,
} from 'lucide-react';
import { DayRecord } from '../types/tracker';
import {
  addDaysToDateStr,
  calculateOverallSummary,
  calculateStreaks,
  formatDurationSeconds,
  formatShortDate,
  getRecordTalkSeconds,
  getTodayStr,
} from '../utils/calculations';

interface DashboardViewProps {
  records: DayRecord[];
  onEditDate: (dateStr: string) => void;
  onLogToday: () => void;
  onLoadSampleData: () => void;
}

type LogFilter = 'ALL' | 'TALKING' | 'NOT_TALKING' | 'MET' | 'NOT_MET' | 'NOTES';

export function DashboardView({
  records,
  onEditDate,
  onLogToday,
  onLoadSampleData,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<LogFilter>('ALL');

  const todayStr = getTodayStr();
  const streaks = useMemo(() => calculateStreaks(records, todayStr), [records, todayStr]);
  const summary = useMemo(() => calculateOverallSummary(records), [records]);

  const recordsMap = useMemo(() => {
    const map = new Map<string, DayRecord>();
    for (const r of records) map.set(r.date, r);
    return map;
  }, [records]);

  const last30Days = useMemo(() => {
    const days: Array<{
      date: string;
      record?: DayRecord;
      talkSeconds: number;
    }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = addDaysToDateStr(todayStr, -i);
      const record = recordsMap.get(date);
      days.push({
        date,
        record,
        talkSeconds: getRecordTalkSeconds(record),
      });
    }
    return days;
  }, [recordsMap, todayStr]);

  const maxTalkSeconds = useMemo(
    () => Math.max(1800, ...last30Days.map((d) => d.talkSeconds)),
    [last30Days]
  );

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...records]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .filter((r) => {
        if (filter === 'TALKING' && r.talkingStatus !== 'TALKING') return false;
        if (filter === 'NOT_TALKING' && r.talkingStatus !== 'NOT_TALKING') return false;
        if (filter === 'MET' && r.meetingStatus !== 'MET') return false;
        if (filter === 'NOT_MET' && r.meetingStatus !== 'NOT_MET') return false;
        if (filter === 'NOTES' && (!r.note || r.note.trim().length === 0)) return false;

        if (!q) return true;
        return (
          r.date.toLowerCase().includes(q) ||
          formatShortDate(r.date).toLowerCase().includes(q) ||
          r.note.toLowerCase().includes(q)
        );
      });
  }, [records, filter, searchQuery]);

  if (summary.totalLoggedDays === 0) {
    return (
      <section
        className="mx-auto max-w-2xl rounded-xl border p-8 text-center sm:p-12"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-primary)',
          }}
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1
          className="font-display mt-4 text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Start your communication log
        </h1>
        <p
          className="mx-auto mt-2 max-w-md text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Record whether you talked or met on any given day, track conversation durations, and keep
          personal notes. Streaks and range totals update automatically here.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onLogToday}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-transform duration-150 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-on-primary)',
            }}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>Log First Entry</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleData}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Load Sample Month</span>
          </button>
        </div>
      </section>
    );
  }

  const streakCards = [
    {
      label: "Days Since Last 'Talking'",
      value: streaks.foundTalking ? streaks.daysSinceTalking : '—',
      subtext: streaks.lastTalkingDate
        ? `Last on ${formatShortDate(streaks.lastTalkingDate)}`
        : 'No talking day recorded yet',
      Icon: MessageCircle,
      tone: 'var(--positive)',
    },
    {
      label: "Days Since Last 'Not Talking'",
      value: streaks.foundNotTalking ? streaks.daysSinceNotTalking : '—',
      subtext: streaks.lastNotTalkingDate
        ? `Last on ${formatShortDate(streaks.lastNotTalkingDate)}`
        : 'No silent day recorded yet',
      Icon: X,
      tone: 'var(--negative)',
    },
    {
      label: "Days Since Last 'Met'",
      value: streaks.foundMeeting ? streaks.daysSinceMeeting : '—',
      subtext: streaks.lastMeetingDate
        ? `Last on ${formatShortDate(streaks.lastMeetingDate)}`
        : 'No meeting recorded yet',
      Icon: Handshake,
      tone: 'var(--positive)',
    },
    {
      label: "Days Since Last 'Did Not Meet'",
      value: streaks.foundNotMeeting ? streaks.daysSinceNotMeeting : '—',
      subtext: streaks.lastNotMeetingDate
        ? `Last on ${formatShortDate(streaks.lastNotMeetingDate)}`
        : 'No missed day recorded yet',
      Icon: UserX,
      tone: 'var(--negative)',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Streak Metrics Strip */}
      <section aria-label="Streak counters">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h1
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Streaks &amp; Continuity
          </h1>
          <div
            className="flex flex-wrap items-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="font-mono-tabular">{summary.totalLoggedDays} days logged</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {formatDurationSeconds(summary.totalTalkSeconds)} total talk time
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {streakCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {card.label}
                </span>
                <card.Icon className="h-4 w-4 shrink-0" style={{ color: card.tone }} aria-hidden="true" />
              </div>
              <div
                className="font-mono-tabular mt-3 text-3xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {card.value}
                {typeof card.value === 'number' && (
                  <span className="ml-1.5 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
                    {card.value === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {card.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 30-Day Activity & Talk Time Timeline */}
      <section
        className="rounded-xl border p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              30-Day Activity &amp; Talk Time
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Bar height indicates talk duration; bottom markers show Talking and Meeting status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: 'var(--positive)' }} aria-hidden="true" />
              <span className="font-mono-tabular">{summary.talkingDays} talked</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Handshake className="h-3.5 w-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <span className="font-mono-tabular">{summary.meetingDays} met</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <span className="font-mono-tabular">{summary.notedDays} notes</span>
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-15 gap-1.5 sm:grid-cols-30 sm:gap-1">
          {last30Days.map((day) => {
            const heightPct =
              day.talkSeconds > 0
                ? Math.max(16, Math.round((day.talkSeconds / maxTalkSeconds) * 100))
                : day.record?.talkingStatus === 'TALKING'
                  ? 12
                  : 0;

            const talkColor =
              day.record?.talkingStatus === 'TALKING'
                ? 'var(--positive)'
                : day.record?.talkingStatus === 'NOT_TALKING'
                  ? 'var(--negative)'
                  : 'var(--border-hairline)';

            const meetColor =
              day.record?.meetingStatus === 'MET'
                ? 'var(--accent-primary)'
                : day.record?.meetingStatus === 'NOT_MET'
                  ? 'var(--text-muted)'
                  : 'transparent';

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onEditDate(day.date)}
                title={`${formatShortDate(day.date)} · ${
                  day.talkSeconds > 0 ? formatDurationSeconds(day.talkSeconds) : '0s'
                }`}
                className="group flex flex-col items-center gap-1 rounded py-1 transition-colors hover:opacity-85 focus-visible:outline-2"
                style={{ outlineColor: 'var(--accent-primary)' }}
              >
                <div
                  className="flex h-20 w-full items-end justify-center rounded-sm px-0.5 pb-0.5"
                  style={{ backgroundColor: 'var(--bg-surface-muted)' }}
                >
                  {heightPct > 0 && (
                    <div
                      className="w-full rounded-xs transition-all duration-150"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    />
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-full rounded-xs"
                  style={{ backgroundColor: talkColor }}
                />
                <span
                  aria-hidden="true"
                  className="h-1 w-full rounded-xs"
                  style={{ backgroundColor: meetColor }}
                />
              </button>
            );
          })}
        </div>

        <div
          className="mt-2 flex items-center justify-between font-mono-tabular text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{formatShortDate(last30Days[0].date)}</span>
          <span>{formatShortDate(todayStr)}</span>
        </div>
      </section>

      {/* Filterable Journal & History Table */}
      <section
        className="rounded-xl border p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recorded Entries
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Click any row to edit status, duration, or notes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or dates..."
              aria-label="Search recorded entries"
              className="min-h-[40px] w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent-primary)',
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {(
            [
              ['ALL', 'All'],
              ['TALKING', 'Talked'],
              ['NOT_TALKING', 'Not Talking'],
              ['MET', 'Met'],
              ['NOT_MET', 'Did Not Meet'],
              ['NOTES', 'With Notes'],
            ] as Array<[LogFilter, string]>
          ).map(([id, label]) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className="min-h-[34px] rounded-md border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface-muted)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-hairline)',
                  color: active ? 'var(--accent-on-primary)' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {filteredRecords.length === 0 ? (
          <div
            className="mt-4 rounded-lg border border-dashed py-8 text-center text-sm"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-muted)',
            }}
          >
            No entries match the current search or filter.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs font-semibold"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 pr-4">Talking</th>
                  <th className="py-2.5 pr-4">Meeting</th>
                  <th className="py-2.5 pr-4 text-right">Duration</th>
                  <th className="py-2.5 pl-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => {
                  const talkSecs = getRecordTalkSeconds(rec);
                  return (
                    <tr
                      key={rec.date}
                      onClick={() => onEditDate(rec.date)}
                      className="cursor-pointer border-b transition-colors hover:opacity-85"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <td
                        className="font-mono-tabular py-3 pr-4 text-xs font-medium whitespace-nowrap sm:text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {formatShortDate(rec.date)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {rec.talkingStatus === 'TALKING' ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'var(--positive)' }}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Talked</span>
                          </span>
                        ) : rec.talkingStatus === 'NOT_TALKING' ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'var(--negative)' }}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Not Talking</span>
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {rec.meetingStatus === 'MET' ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'var(--positive)' }}
                          >
                            <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Met</span>
                          </span>
                        ) : rec.meetingStatus === 'NOT_MET' ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'var(--negative)' }}
                          >
                            <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Did Not Meet</span>
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td
                        className="font-mono-tabular py-3 pr-4 text-right text-xs whitespace-nowrap"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {talkSecs > 0 ? (
                          <span className="inline-flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>{formatDurationSeconds(talkSecs)}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        className="max-w-xs truncate py-3 pl-4 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {rec.note?.trim() ? rec.note : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
