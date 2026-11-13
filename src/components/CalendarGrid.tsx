import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Handshake,
  MessageCircle,
  UserX,
  X,
} from 'lucide-react';
import { DayRecord } from '../types/tracker';
import {
  formatDurationSeconds,
  formatLocalDate,
  formatMonthYear,
  getDaysInMonth,
  getIsoWeekday,
  getRecordTalkSeconds,
  getTodayStr,
} from '../utils/calculations';

interface CalendarGridProps {
  mode: 'talking' | 'meeting';
  year: number;
  monthIndex: number;
  recordsMap: Map<string, DayRecord>;
  selectedDate: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
  isSelectingRange: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({
  mode,
  year,
  monthIndex,
  recordsMap,
  selectedDate,
  rangeStart,
  rangeEnd,
  isSelectingRange,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onSelectDate,
}: CalendarGridProps) {
  const todayStr = getTodayStr();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstIsoWeekday = getIsoWeekday(year, monthIndex, 1); // 1..7
  const leadingEmptyCount = firstIsoWeekday - 1;
  const totalCells = leadingEmptyCount + daysInMonth;
  const trailingEmptyCount = (7 - (totalCells % 7)) % 7;

  const normStart =
    rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : rangeStart;
  const normEnd =
    rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart) : null;

  const isTalkingMode = mode === 'talking';

  return (
    <section
      className="rounded-xl border p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatMonthYear(year, monthIndex)}
          </h1>
          <div
            className="mt-1 flex flex-wrap items-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="inline-flex items-center gap-1">
              {isTalkingMode ? (
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isTalkingMode ? 'Talking Log' : 'Meeting Log'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {isSelectingRange
                ? 'Range selection active: tap start and end dates'
                : 'Tap any date to inspect or update status'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border px-2.5 transition-colors duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
              outlineColor: 'var(--accent-primary)',
            }}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onJumpToday}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
              outlineColor: 'var(--accent-primary)',
            }}
          >
            Today
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border px-2.5 transition-colors duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
              outlineColor: 'var(--accent-primary)',
            }}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-1.5 text-center text-xs font-semibold tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            {day}
          </div>
        ))}

        {Array.from({ length: leadingEmptyCount }).map((_, idx) => (
          <div key={`lead-${idx}`} aria-hidden="true" className="min-h-[60px] sm:min-h-[80px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatLocalDate(year, monthIndex, dayNum);
          const record = recordsMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          const isRangeEdge = dateStr === normStart || dateStr === normEnd;
          const isInRange =
            normStart !== null && normEnd !== null && dateStr >= normStart && dateStr <= normEnd;

          const status = isTalkingMode ? record?.talkingStatus : record?.meetingStatus;
          const isPositive = isTalkingMode ? status === 'TALKING' : status === 'MET';
          const isNegative = isTalkingMode ? status === 'NOT_TALKING' : status === 'NOT_MET';

          const talkSeconds = getRecordTalkSeconds(record);
          const hasNote = Boolean(record?.note && record.note.trim().length > 0);

          let cellBg = 'var(--bg-surface-muted)';
          let cellBorder = 'var(--border-hairline)';
          if (isPositive) {
            cellBg = 'var(--positive-soft)';
            cellBorder = 'var(--positive-border)';
          } else if (isNegative) {
            cellBg = 'var(--negative-soft)';
            cellBorder = 'var(--negative-border)';
          }

          if (isInRange && !isPositive && !isNegative) {
            cellBg = 'var(--accent-soft)';
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              aria-label={`${dateStr}${
                isPositive
                  ? isTalkingMode
                    ? ', Talking'
                    : ', Met'
                  : isNegative
                    ? isTalkingMode
                      ? ', Not Talking'
                      : ', Did Not Meet'
                    : ', Unlogged'
              }`}
              className="group relative flex min-h-[64px] flex-col justify-between rounded-lg border p-1.5 text-left transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-h-[84px] sm:p-2.5"
              style={{
                backgroundColor: cellBg,
                borderColor:
                  isSelected || isRangeEdge ? 'var(--accent-primary)' : cellBorder,
                boxShadow:
                  isSelected || isRangeEdge
                    ? 'inset 0 0 0 1.5px var(--accent-primary)'
                    : isInRange
                      ? 'inset 0 0 0 1px color-mix(in srgb, var(--accent-primary) 40%, transparent)'
                      : undefined,
                outlineColor: 'var(--accent-primary)',
              }}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span
                  className="font-mono-tabular text-xs font-semibold sm:text-sm"
                  style={{
                    color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
                  }}
                >
                  {dayNum}
                </span>

                <div className="flex items-center gap-1">
                  {hasNote && (
                    <FileText
                      className="h-3 w-3 shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Has note"
                    />
                  )}
                  {isToday && (
                    <span
                      className="hidden text-[10px] font-semibold sm:inline"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Today
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-0.5">
                {isPositive && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold leading-tight"
                    style={{ color: 'var(--positive)' }}
                  >
                    {isTalkingMode ? (
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Handshake className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span className="hidden truncate sm:inline">
                      {isTalkingMode ? 'Talked' : 'Met'}
                    </span>
                  </span>
                )}

                {isNegative && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold leading-tight"
                    style={{ color: 'var(--negative)' }}
                  >
                    {isTalkingMode ? (
                      <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <UserX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span className="hidden truncate sm:inline">
                      {isTalkingMode ? 'No talk' : 'No meet'}
                    </span>
                  </span>
                )}

                {isTalkingMode && talkSeconds > 0 && (
                  <span
                    className="hidden items-center gap-1 font-mono-tabular text-[10px] sm:inline-flex"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Clock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{formatDurationSeconds(talkSeconds)}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {Array.from({ length: trailingEmptyCount }).map((_, idx) => (
          <div key={`trail-${idx}`} aria-hidden="true" className="min-h-[60px] sm:min-h-[80px]" />
        ))}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs"
        style={{
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--positive)' }}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isTalkingMode ? 'Talked' : 'Met'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--negative)' }}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isTalkingMode ? 'Did Not Talk' : 'Did Not Meet'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Has Note</span>
          </span>
        </div>
        <span>Mon – Sun week</span>
      </div>
    </section>
  );
}
