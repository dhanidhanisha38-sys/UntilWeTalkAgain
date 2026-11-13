import { CalendarPlus } from 'lucide-react';
import { ActiveTab } from '../types/tracker';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogToday: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'talking', label: 'Talking' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'dashboard', label: 'Dashboard' },
];

export function TopBar({ activeTab, onTabChange, onLogToday }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-150"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:h-16 lg:px-8">
        <button
          type="button"
          onClick={() => onTabChange('talking')}
          className="font-display text-left text-base font-bold tracking-tight whitespace-nowrap shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-lg"
          style={{
            color: 'var(--text-primary)',
            outlineColor: 'var(--accent-primary)',
          }}
        >
          Until We Talk Again
        </button>

        <nav
          aria-label="Primary sections"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className="relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  outlineColor: 'var(--accent-primary)',
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onLogToday}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-on-primary)',
              outlineColor: 'var(--accent-primary)',
            }}
          >
            <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Log Today</span>
          </button>
        </div>
      </div>
    </header>
  );
}
