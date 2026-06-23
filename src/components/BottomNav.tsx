import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { to: '/preview', label: 'preview', icon: '>' },
  { to: '/record', label: 'record', icon: '+' },
  { to: '/settings', label: 'config', icon: '~' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-ink-850/95 backdrop-blur-md border-t-2 border-ink-100 dark:border-ink-700 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-3 h-14 font-mono">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [
                'flex items-center justify-center gap-1.5 text-xs select-none transition-all',
                isActive
                  ? 'text-brand dark:text-brand'
                  : 'text-ink-400 dark:text-ink-500',
              ].join(' ')
            }
          >
            <span className={[
              'text-base leading-none font-bold',
            ].join(' ')}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
