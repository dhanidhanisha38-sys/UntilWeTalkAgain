import { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Handshake,
  MessageCircle,
  RotateCcw,
  Trash2,
  UserX,
  X,
} from 'lucide-react';
import { DayRecord, MeetingStatus, TalkingStatus } from '../types/tracker';
import { addDaysToDateStr, formatReadableDate, getTodayStr } from '../utils/calculations';

interface DayEditorPanelProps {
  dateStr: string;
  record: DayRecord | undefined;
  variant: 'inspector' | 'modal';
  onChangeDate: (nextDateStr: string) => void;
  onSave: (record: DayRecord) => void;
  onDelete: (dateStr: string) => void;
  onClose?: () => void;
}

export function DayEditorPanel({
  dateStr,
  record,
  variant,
  onChangeDate,
  onSave,
  onDelete,
  onClose,
}: DayEditorPanelProps) {
  const [talkingStatus, setTalkingStatus] = useState<TalkingStatus | null>(
    record?.talkingStatus ?? null
  );
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(
    record?.meetingStatus ?? null
  );
  const [talkHours, setTalkHours] = useState<number>(record?.talkHours ?? 0);
  const [talkMinutes, setTalkMinutes] = useState<number>(record?.talkMinutes ?? 0);
  const [talkSeconds, setTalkSeconds] = useState<number>(record?.talkSeconds ?? 0);
  const [note, setNote] = useState<string>(record?.note ?? '');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    setTalkingStatus(record?.talkingStatus ?? null);
    setMeetingStatus(record?.meetingStatus ?? null);
    setTalkHours(record?.talkHours ?? 0);
    setTalkMinutes(record?.talkMinutes ?? 0);
    setTalkSeconds(record?.talkSeconds ?? 0);
    setNote(record?.note ?? '');
    setSavedNotice(false);
  }, [dateStr, record]);

  const commitSave = (overrides?: Partial<DayRecord>) => {
    const nextRecord: DayRecord = {
      date: dateStr,
      talkingStatus:
        overrides && 'talkingStatus' in overrides
          ? overrides.talkingStatus ?? null
          : talkingStatus,
      meetingStatus:
        overrides && 'meetingStatus' in overrides
          ? overrides.meetingStatus ?? null
          : meetingStatus,
      talkHours:
        overrides && typeof overrides.talkHours === 'number'
          ? Math.max(0, overrides.talkHours)
          : Math.max(0, talkHours),
      talkMinutes:
        overrides && typeof overrides.talkMinutes === 'number'
          ? Math.min(59, Math.max(0, overrides.talkMinutes))
          : Math.min(59, Math.max(0, talkMinutes)),
      talkSeconds:
        overrides && typeof overrides.talkSeconds === 'number'
          ? Math.min(59, Math.max(0, overrides.talkSeconds))
          : Math.min(59, Math.max(0, talkSeconds)),
      note: overrides && typeof overrides.note === 'string' ? overrides.note : note,
    };
    onSave(nextRecord);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const addMinutesPreset = (minsToAdd: number) => {
    const totalSeconds =
      talkHours * 3600 + talkMinutes * 60 + talkSeconds + minsToAdd * 60;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    setTalkHours(h);
    setTalkMinutes(m);
    setTalkSeconds(s);
  };

  const isToday = dateStr === getTodayStr();

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{isToday ? 'Today' : 'Selected Date'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{dateStr}</span>
          </div>
          <h2
            className="font-display mt-0.5 text-lg font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatReadableDate(dateStr)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeDate(addDaysToDateStr(dateStr, -1))}
            aria-label="Previous day"
            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onChangeDate(addDaysToDateStr(dateStr, 1))}
            aria-label="Next day"
            className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {variant === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close editor"
              className="ml-1 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Talking Status */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Talking Status</span>
          </span>
          {talkingStatus && (
            <button
              type="button"
              onClick={() => {
                setTalkingStatus(null);
                commitSave({ talkingStatus: null });
              }}
              className="text-xs hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setTalkingStatus('TALKING');
              commitSave({ talkingStatus: 'TALKING' });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={{
              backgroundColor:
                talkingStatus === 'TALKING'
                  ? 'var(--positive-soft)'
                  : 'var(--bg-surface-muted)',
              borderColor:
                talkingStatus === 'TALKING'
                  ? 'var(--positive)'
                  : 'var(--border-hairline)',
              color:
                talkingStatus === 'TALKING'
                  ? 'var(--positive)'
                  : 'var(--text-secondary)',
            }}
          >
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Talking</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTalkingStatus('NOT_TALKING');
              commitSave({ talkingStatus: 'NOT_TALKING' });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={{
              backgroundColor:
                talkingStatus === 'NOT_TALKING'
                  ? 'var(--negative-soft)'
                  : 'var(--bg-surface-muted)',
              borderColor:
                talkingStatus === 'NOT_TALKING'
                  ? 'var(--negative)'
                  : 'var(--border-hairline)',
              color:
                talkingStatus === 'NOT_TALKING'
                  ? 'var(--negative)'
                  : 'var(--text-secondary)',
            }}
          >
            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Not Talking</span>
          </button>
        </div>
      </div>

      {/* Meeting Status */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Meeting Status</span>
          </span>
          {meetingStatus && (
            <button
              type="button"
              onClick={() => {
                setMeetingStatus(null);
                commitSave({ meetingStatus: null });
              }}
              className="text-xs hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMeetingStatus('MET');
              commitSave({ meetingStatus: 'MET' });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={{
              backgroundColor:
                meetingStatus === 'MET'
                  ? 'var(--positive-soft)'
                  : 'var(--bg-surface-muted)',
              borderColor:
                meetingStatus === 'MET'
                  ? 'var(--positive)'
                  : 'var(--border-hairline)',
              color:
                meetingStatus === 'MET'
                  ? 'var(--positive)'
                  : 'var(--text-secondary)',
            }}
          >
            <Handshake className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Met</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMeetingStatus('NOT_MET');
              commitSave({ meetingStatus: 'NOT_MET' });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={{
              backgroundColor:
                meetingStatus === 'NOT_MET'
                  ? 'var(--negative-soft)'
                  : 'var(--bg-surface-muted)',
              borderColor:
                meetingStatus === 'NOT_MET'
                  ? 'var(--negative)'
                  : 'var(--border-hairline)',
              color:
                meetingStatus === 'NOT_MET'
                  ? 'var(--negative)'
                  : 'var(--text-secondary)',
            }}
          >
            <UserX className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Did Not Meet</span>
          </button>
        </div>
      </div>

      {/* Talk Duration */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Talk Duration</span>
          </span>
          {(talkHours > 0 || talkMinutes > 0 || talkSeconds > 0) && (
            <button
              type="button"
              onClick={() => {
                setTalkHours(0);
                setTalkMinutes(0);
                setTalkSeconds(0);
              }}
              className="inline-flex items-center gap-1 text-xs hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Hours
            </span>
            <input
              type="number"
              min={0}
              max={24}
              value={talkHours}
              onChange={(e) => setTalkHours(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
              className="font-mono-tabular min-h-[40px] w-full rounded-lg border px-2.5 py-1.5 text-sm font-medium focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent-primary)',
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Minutes
            </span>
            <input
              type="number"
              min={0}
              max={59}
              value={talkMinutes}
              onChange={(e) =>
                setTalkMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))
              }
              className="font-mono-tabular min-h-[40px] w-full rounded-lg border px-2.5 py-1.5 text-sm font-medium focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent-primary)',
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Seconds
            </span>
            <input
              type="number"
              min={0}
              max={59}
              value={talkSeconds}
              onChange={(e) =>
                setTalkSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))
              }
              className="font-mono-tabular min-h-[40px] w-full rounded-lg border px-2.5 py-1.5 text-sm font-medium focus-visible:outline-2"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
                outlineColor: 'var(--accent-primary)',
              }}
            />
          </label>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[15, 30, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => addMinutesPreset(mins)}
              className="min-h-[30px] rounded-md border px-2.5 py-1 font-mono-tabular text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface-muted)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
            >
              +{mins === 60 ? '1h' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Optional Note
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a brief memory, call topic, or reflection..."
            className="w-full resize-none rounded-lg border p-3 text-sm leading-relaxed focus-visible:outline-2"
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
              outlineColor: 'var(--accent-primary)',
            }}
          />
        </label>
      </div>

      {/* Save / Delete Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {record ? (
          <button
            type="button"
            onClick={() => {
              onDelete(dateStr);
              if (variant === 'modal' && onClose) onClose();
            }}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--border-hairline)',
              color: 'var(--negative)',
            }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Day</span>
          </button>
        ) : (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {savedNotice ? 'Entry saved' : 'Status taps save immediately'}
          </span>
        )}

        <div className="flex items-center gap-2">
          {savedNotice && record && (
            <span className="text-xs font-medium" style={{ color: 'var(--positive)' }}>
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              commitSave();
              if (variant === 'modal' && onClose) onClose();
            }}
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-transform duration-150 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-on-primary)',
            }}
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'inspector') {
    return (
      <section
        className="rounded-xl border p-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        {content}
      </section>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit entry for ${dateStr}`}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1.5 w-10 rounded-full sm:hidden"
          style={{ backgroundColor: 'var(--border-hairline)' }}
        />
        {content}
      </div>
    </div>
  );
}
