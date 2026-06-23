import { useState } from 'react';
import { applyTheme, getStoredTheme, setStoredTheme, type Theme } from '../lib/theme';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
  }

  function pick(t: Theme) {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem('schedule-record:theme', t);
    } catch {}
  }

  return (
    <div className="min-h-full px-4 py-6 max-w-md mx-auto w-full">
      <h2 className="text-lg font-medium text-ink-900 dark:text-ink-100 mb-4 font-mono">
        {'~/settings'}
      </h2>

      <section className="bg-white dark:bg-ink-850 rounded-xl border border-ink-100 dark:border-ink-700 overflow-hidden">
        <div className="px-4 py-3 text-[11px] text-ink-400 dark:text-ink-500 border-b border-ink-50 dark:border-ink-700/50 font-mono tracking-wide">
          {'// appearance'}
        </div>
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-4 py-3 active:bg-ink-50 dark:active:bg-ink-800/50"
        >
          <div>
            <div className="text-sm text-ink-800 dark:text-ink-100 font-medium">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </div>
            <div className="text-xs text-ink-400 dark:text-ink-500 mt-0.5 font-mono">
              status: {theme === 'dark' ? 'enabled' : 'disabled'}
            </div>
          </div>
          <span
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-brand' : 'bg-ink-200 dark:bg-ink-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : ''
              }`}
            />
          </span>
        </button>
        <div className="flex gap-2 px-4 py-3 border-t border-ink-50 dark:border-ink-700/50">
          <button
            onClick={() => pick('light')}
            className={`flex-1 h-9 rounded-lg text-sm font-mono transition-all ${
              theme === 'light'
                ? 'bg-brand text-ink-950 font-medium'
                : 'bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 border border-ink-100 dark:border-ink-700'
            }`}
          >
            light
          </button>
          <button
            onClick={() => pick('dark')}
            className={`flex-1 h-9 rounded-lg text-sm font-mono transition-all ${
              theme === 'dark'
                ? 'bg-brand text-ink-950 font-medium'
                : 'bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 border border-ink-100 dark:border-ink-700'
            }`}
          >
            dark
          </button>
        </div>
      </section>

      <p className="text-xs text-ink-400 dark:text-ink-500 mt-6 text-center font-mono">
        {'// data stored locally · clearing browser data will lose records'}
      </p>
    </div>
  );
}
