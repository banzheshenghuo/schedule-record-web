import { useMemo, useState } from 'react';
import DateBar from '../components/DateBar';
import ConfirmButton from '../components/ConfirmButton';
import { useRecordsByDate } from '../hooks/useRecordsByDate';
import { toDateKey } from '../lib/date';
import { formatDayMarkdown } from '../lib/format';

export default function PreviewPage() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { record } = useRecordsByDate(date);
  const [toast, setToast] = useState<string | null>(null);

  const markdown = useMemo(() => formatDayMarkdown(record), [record]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      flash('已复制到剪贴板');
    } catch {
      // 兼容降级
      const ta = document.createElement('textarea');
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flash('已复制到剪贴板');
      } catch {
        flash('复制失败，请手动选择');
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
      <DateBar date={date} onChange={setDate} />
      <div className="sticky top-0 z-10 bg-[#f5f6f8] dark:bg-zinc-900 px-3 py-2 max-w-md mx-auto w-full">
        <ConfirmButton className="w-full" onClick={handleCopy}>
          复制 Markdown
        </ConfirmButton>
      </div>
      <div className="flex-1 px-3 py-2 space-y-2 max-w-md mx-auto w-full">
        <pre className="whitespace-pre-wrap break-words bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 p-3 text-[13px] leading-relaxed text-gray-800 dark:text-zinc-100 shadow-sm">
{markdown}
        </pre>
      </div>
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 bg-gray-900/85 text-white text-sm px-4 py-2 rounded-full">
          {toast}
        </div>
      )}
    </div>
  );
}
