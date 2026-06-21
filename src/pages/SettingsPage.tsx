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
      <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-4">设置</h2>

      <section className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
        <div className="px-4 py-3 text-xs text-gray-400 dark:text-zinc-500 border-b border-gray-50 dark:border-zinc-700/50">
          外观
        </div>
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50 dark:active:bg-zinc-700/50"
        >
          <div>
            <div className="text-sm text-gray-800 dark:text-zinc-100">夜间模式</div>
            <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              当前：{theme === 'dark' ? '已开启' : '已关闭'}
            </div>
          </div>
          <span
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-brand' : 'bg-gray-200 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : ''
              }`}
            />
          </span>
        </button>
        <div className="flex gap-2 px-4 py-3 border-t border-gray-50 dark:border-zinc-700/50">
          <button
            onClick={() => pick('light')}
            className={`flex-1 h-9 rounded-lg text-sm ${
              theme === 'light'
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            浅色
          </button>
          <button
            onClick={() => pick('dark')}
            className={`flex-1 h-9 rounded-lg text-sm ${
              theme === 'dark'
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            深色
          </button>
        </div>
      </section>

      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-6 text-center">
        数据存储于本机，清除浏览器数据将丢失
      </p>
    </div>
  );
}
