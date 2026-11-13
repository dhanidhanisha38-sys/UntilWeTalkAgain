import { BarChart3, Handshake, MessageCircle } from 'lucide-react';
import { ActiveTab } from '../types/tracker';

interface MobileNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const MOBILE_TABS: Array<{
  id: ActiveTab;
  label: string;
  Icon: typeof MessageCircle;
}> = [
  { id: 'talking', label: 'Talking', Icon: MessageCircle },
  { id: 'meeting', label: 'Meeting', Icon: Handshake },
  { id: 'dashboard', label: 'Dashboard', Icon: BarChart3 },
];

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur-md md:hidden"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="grid h-14 grid-cols-3 items-center">
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              style={{
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                outlineColor: 'var(--accent-primary)',
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
