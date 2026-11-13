import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Palette, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { CalendarGrid } from './components/CalendarGrid';
import { DashboardView } from './components/DashboardView';
import { DayEditorPanel } from './components/DayEditorPanel';
import { MobileNavBar } from './components/MobileNavBar';
import { RangeSummaryCard } from './components/RangeSummaryCard';
import { TopBar } from './components/TopBar';
import { ActiveTab, AppThemeMode, DayRecord } from './types/tracker';
import { getTodayStr, parseLocalDateParts } from './utils/calculations';
import {
  generateSampleMonthRecords,
  isRecordEmpty,
  loadRecordsFromStorage,
  loadThemeFromStorage,
  normalizeRecord,
  saveRecordsToStorage,
  saveThemeToStorage,
} from './utils/storage';

const THEME_OPTIONS: Array<{ id: AppThemeMode; label: string; swatch: string }> = [
  { id: 'CLASSIC_INDIGO', label: 'Classic Indigo', swatch: '#3F51B5' },
  { id: 'INDIGO_DARK', label: 'Indigo Dark', swatch: '#7986CB' },
  { id: 'WARM_SUNSET', label: 'Warm Sunset', swatch: '#D84315' },
  { id: 'FOREST_CALM', label: 'Forest Calm', swatch: '#2E7D32' },
];

export default function App() {
  const [records, setRecords] = useState<DayRecord[]>(() => loadRecordsFromStorage());
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => loadThemeFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('talking');

  const todayStr = getTodayStr();
  const todayParts = parseLocalDateParts(todayStr);

  const [viewYear, setViewYear] = useState<number>(todayParts.year);
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(todayParts.monthIndex);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [modalDate, setModalDate] = useState<string | null>(null);

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState<boolean>(false);

  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveRecordsToStorage(records);
  }, [records]);

  useEffect(() => {
    saveThemeToStorage(themeMode);
    const root = document.documentElement;
    root.classList.remove('dark');
    root.removeAttribute('data-theme');

    if (themeMode === 'INDIGO_DARK') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'indigo-dark');
    } else if (themeMode === 'WARM_SUNSET') {
      root.setAttribute('data-theme', 'warm-sunset');
    } else if (themeMode === 'FOREST_CALM') {
      root.setAttribute('data-theme', 'forest-calm');
    }
  }, [themeMode]);

  const recordsMap = useMemo(() => {
    const map = new Map<string, DayRecord>();
    for (const r of records) {
      map.set(r.date, r);
    }
    return map;
  }, [records]);

  const showTransientMessage = (msg: string) => {
    setStatusMessage(msg);
    window.setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleSaveRecord = (nextRecord: DayRecord) => {
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.date !== nextRecord.date);
      if (isRecordEmpty(nextRecord)) {
        return filtered;
      }
      return [...filtered, nextRecord];
    });
  };

  const handleDeleteRecord = (dateStr: string) => {
    setRecords((prev) => prev.filter((r) => r.date !== dateStr));
  };

  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewYear((y) => y - 1);
      setViewMonthIndex(11);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewYear((y) => y + 1);
      setViewMonthIndex(0);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const nowStr = getTodayStr();
    const parts = parseLocalDateParts(nowStr);
    setViewYear(parts.year);
    setViewMonthIndex(parts.monthIndex);
    setSelectedDate(nowStr);
  };

  const handleCalendarDateClick = (dateStr: string) => {
    if (isSelectingRange) {
      if (rangeStart === null || (rangeStart !== null && rangeEnd !== null)) {
        setRangeStart(dateStr);
        setRangeEnd(null);
      } else {
        setRangeEnd(dateStr);
        setIsSelectingRange(false);
      }
      setSelectedDate(dateStr);
      return;
    }

    setSelectedDate(dateStr);
    if (window.innerWidth < 1024) {
      setModalDate(dateStr);
    }
  };

  const handleOpenDateInEditor = (dateStr: string) => {
    const parts = parseLocalDateParts(dateStr);
    setViewYear(parts.year);
    setViewMonthIndex(parts.monthIndex);
    setSelectedDate(dateStr);
    setModalDate(dateStr);
  };

  const handleLogToday = () => {
    const nowStr = getTodayStr();
    const parts = parseLocalDateParts(nowStr);
    setViewYear(parts.year);
    setViewMonthIndex(parts.monthIndex);
    setSelectedDate(nowStr);
    setModalDate(nowStr);
  };

  const handleLoadSampleData = () => {
    const sample = generateSampleMonthRecords(getTodayStr());
    setRecords((prev) => {
      const merged = new Map<string, DayRecord>();
      for (const r of prev) merged.set(r.date, r);
      for (const s of sample) {
        if (!merged.has(s.date)) merged.set(s.date, s);
      }
      return Array.from(merged.values());
    });
    showTransientMessage('Sample month entries added.');
  };

  const handleExportJson = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `until-we-talk-again-${getTodayStr()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showTransientMessage('Exported entries as JSON.');
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawList: unknown[] | null = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.records)
          ? parsed.records
          : null;

      if (!rawList) {
        showTransientMessage('Invalid JSON format.');
        return;
      }

      const validRecords = rawList
        .map((item: unknown) => normalizeRecord(item))
        .filter((r: DayRecord | null): r is DayRecord => r !== null);

      setRecords((prev) => {
        const merged = new Map<string, DayRecord>();
        for (const r of prev) merged.set(r.date, r);
        for (const item of validRecords) merged.set(item.date, item);
        return Array.from(merged.values());
      });

      showTransientMessage(`Imported ${validRecords.length} entries.`);
    } catch {
      showTransientMessage('Could not read JSON file.');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-12">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} onLogToday={handleLogToday} />

      <main className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        {/* Workspace Toolbar: Theme Selector & Data Tools */}
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Theme</span>
            </span>

            <div
              className="flex flex-wrap items-center gap-1 rounded-lg border p-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              {THEME_OPTIONS.map((opt) => {
                const active = themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setThemeMode(opt.id)}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-150"
                    style={{
                      backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: opt.swatch }}
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusMessage && (
              <span className="mr-2 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                {statusMessage}
              </span>
            )}

            {records.length === 0 && (
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Load Sample</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJson}
              disabled={records.length === 0}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-45"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Import</span>
            </button>

            {records.length > 0 &&
              (confirmClearAll ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRecords([]);
                      setRangeStart(null);
                      setRangeEnd(null);
                      setConfirmClearAll(false);
                      showTransientMessage('All entries cleared.');
                    }}
                    className="min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap"
                    style={{ backgroundColor: 'var(--negative)' }}
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="min-h-[36px] rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              ))}
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <DashboardView
            records={records}
            onEditDate={handleOpenDateInEditor}
            onLogToday={handleLogToday}
            onLoadSampleData={handleLoadSampleData}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_380px] lg:items-start">
            <div className="flex flex-col gap-6">
              <CalendarGrid
                mode={activeTab}
                year={viewYear}
                monthIndex={viewMonthIndex}
                recordsMap={recordsMap}
                selectedDate={selectedDate}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                isSelectingRange={isSelectingRange}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onJumpToday={handleJumpToday}
                onSelectDate={handleCalendarDateClick}
              />

              {/* Mobile / Tablet Range Summary below calendar */}
              <div className="lg:hidden">
                <RangeSummaryCard
                  records={records}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  isSelectingRange={isSelectingRange}
                  onToggleRangeSelect={() => setIsSelectingRange((v) => !v)}
                  onSetRange={(start, end) => {
                    setRangeStart(start);
                    setRangeEnd(end);
                    setIsSelectingRange(false);
                  }}
                />
              </div>
            </div>

            {/* Desktop Right Rail Inspector + Range Totals */}
            <aside className="hidden lg:sticky lg:top-22 lg:flex lg:flex-col lg:gap-6">
              <DayEditorPanel
                dateStr={selectedDate}
                record={recordsMap.get(selectedDate)}
                variant="inspector"
                onChangeDate={(nextDate) => {
                  const parts = parseLocalDateParts(nextDate);
                  setViewYear(parts.year);
                  setViewMonthIndex(parts.monthIndex);
                  setSelectedDate(nextDate);
                }}
                onSave={handleSaveRecord}
                onDelete={handleDeleteRecord}
              />

              <RangeSummaryCard
                records={records}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                isSelectingRange={isSelectingRange}
                onToggleRangeSelect={() => setIsSelectingRange((v) => !v)}
                onSetRange={(start, end) => {
                  setRangeStart(start);
                  setRangeEnd(end);
                  setIsSelectingRange(false);
                }}
              />
            </aside>
          </div>
        )}
      </main>

      {modalDate && (
        <DayEditorPanel
          dateStr={modalDate}
          record={recordsMap.get(modalDate)}
          variant="modal"
          onChangeDate={(nextDate) => {
            const parts = parseLocalDateParts(nextDate);
            setViewYear(parts.year);
            setViewMonthIndex(parts.monthIndex);
            setSelectedDate(nextDate);
            setModalDate(nextDate);
          }}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
          onClose={() => setModalDate(null)}
        />
      )}

      <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
