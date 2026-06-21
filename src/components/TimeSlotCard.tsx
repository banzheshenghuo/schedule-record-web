import type { TimeSlot } from '../types/record';
import { minutesToLabel } from '../lib/timeGrid';

interface Props {
  slot: TimeSlot;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TimeSlotCard({ slot, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-brand font-medium">
            {minutesToLabel(slot.start)} - {minutesToLabel(slot.end)}
          </span>
          <span className="text-gray-400 text-xs">
            {Math.round((slot.end - slot.start) / 6) / 10}h
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-500 active:bg-gray-100 rounded-full"
              onClick={onEdit}
              aria-label="编辑"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              className="w-8 h-8 flex items-center justify-center text-red-500 active:bg-red-50 rounded-full"
              onClick={onDelete}
              aria-label="删除"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
        {slot.content.trim() || <span className="text-gray-300">（无内容）</span>}
      </p>
    </div>
  );
}
