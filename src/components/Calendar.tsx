import { useMemo, useState } from 'react';
import { fromDateKey, toDateKey } from '../lib/date';

interface Props {
  currentDate: string;
  recordedDates: Set<string>;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function Calendar({ currentDate, recordedDates, onSelect, onClose }: Props) {
  const initial = fromDateKey(currentDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const todayKey = toDateKey(new Date());

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // 周一 = 0, 周日 = 6
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (string | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(toDateKey(new Date(viewYear, viewMonth, d)));
    }
    // 补齐到 7 的倍数
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const monthLabel = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="关闭"
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white dark:bg-ink-850 rounded-t-2xl px-4 pt-4 border-t-2 border-brand/30 font-mono"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="w-9 h-9 flex items-center justify-center text-ink-400 active:bg-ink-50 dark:active:bg-ink-800 rounded-lg text-lg"
            onClick={prevMonth}
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-base font-medium text-ink-900 dark:text-ink-100">
              {monthLabel}
            </div>
            <div className="text-[11px] text-ink-400 dark:text-ink-500">
              {'// calendar'}
            </div>
          </div>
          <button
            className="w-9 h-9 flex items-center justify-center text-ink-400 active:bg-ink-50 dark:active:bg-ink-800 rounded-lg text-lg"
            onClick={nextMonth}
          >
            →
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center text-[11px] text-ink-400 dark:text-ink-500 py-1"
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((dateKey, i) => {
            if (!dateKey) return <div key={i} className="h-12" />;

            const isToday = dateKey === todayKey;
            const isSelected = dateKey === currentDate;
            const hasRecord = recordedDates.has(dateKey);

            return (
              <button
                key={dateKey}
                className="h-12 flex flex-col items-center justify-center active:scale-95 transition-transform"
                onClick={() => {
                  onSelect(dateKey);
                  onClose();
                }}
              >
                <span
                  className={[
                    'w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all',
                    isSelected
                      ? 'bg-brand text-ink-950 font-medium gk-border-glow'
                      : isToday
                        ? 'border border-brand text-brand'
                        : 'text-ink-700 dark:text-ink-200',
                  ].join(' ')}
                >
                  {fromDateKey(dateKey).getDate()}
                </span>
                <span
                  className={[
                    'mt-0.5 h-1 w-1 rounded-full',
                    hasRecord ? 'bg-brand' : 'bg-transparent',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
          <span className="text-[11px] text-ink-400 dark:text-ink-500">
            {'• = has records'}
          </span>
          <button
            className="text-xs text-brand font-medium"
            onClick={() => {
              onSelect(todayKey);
              onClose();
            }}
          >
            jump to today
          </button>
        </div>
      </div>
    </div>
  );
}
