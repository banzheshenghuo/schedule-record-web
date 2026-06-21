import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { to: '/preview', label: '预览', icon: '📋' },
  { to: '/record', label: '记录', icon: '✏️' },
  { to: '/settings', label: '设置', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-3 h-14">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 text-xs select-none',
                isActive ? 'text-brand' : 'text-gray-500',
              ].join(' ')
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
