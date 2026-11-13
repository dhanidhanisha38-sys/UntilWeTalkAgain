import { CalendarRange, Check, Clock, Handshake, MessageCircle, X } from 'lucide-react';
import { DayRecord } from '../types/tracker';
import {
  addDaysToDateStr,
  calculateRangeTotals,
  formatDurationSeconds,
  formatLocalDate,
  formatShortDate,
  getTodayStr,
} from '../utils/calculations';

interface RangeSummaryCardProps {
  records: DayRecord[];
  rangeStart: string | null;
  rangeEnd: string | null;
  isSelectingRange: boolean;
  onToggleRangeSelect: () => void;
  onSetRange: (start: string | null, end: string | null) => void;
}

export function RangeSummaryCard({
  records,
  rangeStart,
  rangeEnd,
  isSelectingRange,
  onToggleRangeSelect,
  onSetRange,
}: RangeSummaryCardProps) {
  const today = getTodayStr();
  const hasRange = rangeStart !== null && rangeEnd !== null;
  const totals = hasRange ? calculateRangeTotals(records, rangeStart, rangeEnd) : null;

  const applyLastDays = (days: number) => {
    onSetRange(addDaysToDateStr(today, -(days - 1)), today);
  };

  const applyThisMonth = () => {
    const now = new Date();
    const first = formatLocalDate(now.getFullYear(), now.getMonth(), 1);
    onSetRange(first, today);
  };

  return (
    <section
      className="rounded-xl border p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Date Range Totals
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            {isSelectingRange
              ? rangeStart && !rangeEnd
                ? `Start: ${formatShortDate(rangeStart)} · Tap an end date`
                : 'Tap start and end dates on the calendar'
              : totals
                ? `${formatShortDate(totals.startDate)} – ${formatShortDate(totals.endDate)} · ${totals.totalDays} days`
                : 'Select two dates or choose a preset'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleRangeSelect}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150"
          style={{
            backgroundColor: isSelectingRange ? 'var(--accent-primary)' : 'var(--bg-surface-muted)',
            borderColor: isSelectingRange ? 'var(--accent-primary)' : 'var(--border-hairline)',
            color: isSelectingRange ? 'var(--accent-on-primary)' : 'var(--text-primary)',
          }}
        >
          <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSelectingRange ? 'Done' : 'Pick on Calendar'}</span>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => applyLastDays(7)}
          className="min-h-[32px] rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface-muted)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-secondary)',
          }}
        >
          Last 7 Days
        </button>
        <button
          type="button"
          onClick={() => applyLastDays(30)}
          className="min-h-[32px] rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface-muted)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-secondary)',
          }}
        >
          Last 30 Days
        </button>
        <button
          type="button"
          onClick={applyThisMonth}
          className="min-h-[32px] rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface-muted)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-secondary)',
          }}
        >
          This Month
        </button>
        {(rangeStart || rangeEnd) && (
          <button
            type="button"
            onClick={() => onSetRange(null, null)}
            className="min-h-[32px] rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        )}
      </div>

      {totals ? (
        <div
          className="mt-4 grid grid-cols-2 gap-3 border-t pt-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: 'var(--bg-surface-muted)' }}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Talking</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3 font-mono-tabular text-sm font-semibold">
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--positive)' }}>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {totals.talkingDays}d
              </span>
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--negative)' }}>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {totals.notTalkingDays}d
              </span>
            </div>
          </div>

          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: 'var(--bg-surface-muted)' }}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Meeting</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3 font-mono-tabular text-sm font-semibold">
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--positive)' }}>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {totals.meetingDays}d
              </span>
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--negative)' }}>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {totals.notMeetingDays}d
              </span>
            </div>
          </div>

          <div
            className="col-span-2 flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{ backgroundColor: 'var(--bg-surface-muted)' }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Total Talk Time</span>
            </span>
            <span className="font-mono-tabular text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formatDurationSeconds(totals.totalTalkSeconds)}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="mt-4 rounded-lg border border-dashed px-3 py-4 text-center text-xs"
          style={{
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-muted)',
          }}
        >
          {rangeStart && !rangeEnd
            ? `Start selected (${formatShortDate(rangeStart)}). Click an end date on the calendar to calculate totals.`
            : 'Choose a preset above or toggle Pick on Calendar to measure any span of days.'}
        </div>
      )}
    </section>
  );
}
