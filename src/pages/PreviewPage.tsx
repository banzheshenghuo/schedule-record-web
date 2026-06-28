import { useMemo, useState } from 'react';
import DateBar from '../components/DateBar';
import ConfirmButton from '../components/ConfirmButton';
import Calendar from '../components/Calendar';
import { useRecordsByDate } from '../hooks/useRecordsByDate';
import { toDateKey } from '../lib/date';
import { formatDayMarkdown } from '../lib/format';
import { getRecordedDates } from '../lib/storage';

export default function PreviewPage() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { record } = useRecordsByDate(date);
  const [toast, setToast] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const markdown = useMemo(() => formatDayMarkdown(record), [record]);

  const recordedDates = useMemo(() => {
    return new Set(getRecordedDates());
  }, [date, showCalendar]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      flash('copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flash('copied to clipboard');
      } catch {
        flash('copy failed');
      }
      document.body.removeChild(ta);
    }
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="min-h-full flex flex-col">
      <DateBar date={date} onChange={setDate} onDateClick={() => setShowCalendar(true)} />
      <div className="sticky top-0 z-10 bg-ink-50 dark:bg-ink-950 px-3 py-2 max-w-md mx-auto w-full">
        <ConfirmButton className="w-full font-mono" onClick={handleCopy}>
          {'> '}copy markdown
        </ConfirmButton>
      </div>
      <div className="flex-1 px-3 py-2 space-y-2 max-w-md mx-auto w-full">
        <pre className="whitespace-pre-wrap break-words bg-white dark:bg-ink-850 rounded-xl border border-ink-100 dark:border-ink-700 p-4 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200 shadow-sm font-mono">
{markdown}
        </pre>
      </div>
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 bg-ink-900 dark:bg-ink-700 text-brand text-sm px-4 py-2 rounded-lg font-mono border border-brand/30 gk-border-glow">
          {'> '}{toast}
        </div>
      )}
      {showCalendar && (
        <Calendar
          currentDate={date}
          recordedDates={recordedDates}
          onSelect={setDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
