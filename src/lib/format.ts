import type { DayRecord } from '../types/record';
import { minutesToLabel } from './timeGrid';

export function formatDayMarkdown(record: DayRecord): string {
  const header = `# ${record.date} 工作记录`;
  const slots = [...record.slots].sort((a, b) => a.start - b.start);
  if (slots.length === 0) {
    return `${header}\n\n（暂无记录）`;
  }
  const lines = slots.map(
    (s) => `- ${minutesToLabel(s.start)}-${minutesToLabel(s.end)} ${s.content.trim() || '（无内容）'}`
  );
  return `${header}\n\n${lines.join('\n')}`;
}
