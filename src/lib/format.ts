import type { DayRecord } from '../types/record';
import { minutesToLabel } from './timeGrid';

export function formatDayMarkdown(record: DayRecord): string {
  const header = `# ${record.date} 工作记录`;
  const slots = [...record.slots].sort((a, b) => a.start - b.start);
  if (slots.length === 0) {
    return `${header}\n\n（暂无记录）`;
  }
  const lines = slots.flatMap((s) => {
    const main = `- ${minutesToLabel(s.start)}-${minutesToLabel(s.end)} ${s.content.trim() || '（无内容）'}`;
    const idea = s.idea?.trim() ? `  > 💡 ${s.idea.trim()}` : [];
    return [main, ...idea];
  });
  return `${header}\n\n${lines.join('\n')}`;
}
