import { addDays, isToday, shortLabel } from '../lib/date';

interface Props {
  date: string;
  onChange: (next: string) => void;
}

export default function DateBar({ date, onChange }: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700">
      <button
        aria-label="前一天"
        className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-zinc-300 active:bg-gray-100 dark:active:bg-zinc-700 rounded-full"
        onClick={() => onChange(addDays(date, -1))}
      >
        ‹
      </button>
      <div className="flex flex-col items-center">
        <span className="text-base font-medium text-gray-900 dark:text-zinc-100">{shortLabel(date)}</span>
        <span className="text-xs text-gray-400 dark:text-zinc-500">{date}</span>
      </div>
      <div className="flex items-center gap-1">
        {!isToday(date) && (
          <button
            className="text-xs text-brand px-2 h-9 rounded-full active:bg-blue-50 dark:active:bg-blue-900/30"
            onClick={() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, '0');
              const d = String(today.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
            }}
          >
            今天
          </button>
        )}
        <button
          aria-label="后一天"
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-zinc-300 active:bg-gray-100 dark:active:bg-zinc-700 rounded-full"
          onClick={() => onChange(addDays(date, 1))}
        >
          ›
        </button>
      </div>
    </div>
  );
}
