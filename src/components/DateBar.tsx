import { addDays, isToday, shortLabel } from '../lib/date';

interface Props {
  date: string;
  onChange: (next: string) => void;
}

export default function DateBar({ date, onChange }: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-ink-850 border-b border-ink-100 dark:border-ink-700">
      <button
        aria-label="前一天"
        className="w-10 h-10 flex items-center justify-center text-ink-400 dark:text-ink-400 active:bg-ink-50 dark:active:bg-ink-800 rounded-lg font-mono text-lg"
        onClick={() => onChange(addDays(date, -1))}
      >
        ←
      </button>
      <div className="flex flex-col items-center">
        <span className="text-base font-medium text-ink-900 dark:text-ink-100">
          {shortLabel(date)}
        </span>
        <span className="text-[11px] text-ink-400 dark:text-ink-500 font-mono tracking-wider">
          {date}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {!isToday(date) && (
          <button
            className="text-xs text-brand px-2.5 h-8 rounded-md active:bg-brand/10 font-mono border border-brand/30 dark:border-brand/30"
            onClick={() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, '0');
              const d = String(today.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
            }}
          >
            now
          </button>
        )}
        <button
          aria-label="后一天"
          className="w-10 h-10 flex items-center justify-center text-ink-400 dark:text-ink-400 active:bg-ink-50 dark:active:bg-ink-800 rounded-lg font-mono text-lg"
          onClick={() => onChange(addDays(date, 1))}
        >
          →
        </button>
      </div>
    </div>
  );
}
