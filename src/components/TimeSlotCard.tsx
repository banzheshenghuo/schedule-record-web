import { useEffect, useRef, useState } from 'react';
import type { TimeSlot } from '../types/record';
import { minutesToLabel } from '../lib/timeGrid';

interface Props {
  slot: TimeSlot;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LONG_PRESS_MS = 450;
const MOVE_THRESHOLD = 10;

export default function TimeSlotCard({ slot, onEdit, onDelete }: Props) {
  const timerRef = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [pressing, setPressing] = useState(false);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function startPress(e: React.PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    setPressing(true);
    timerRef.current = window.setTimeout(() => {
      setPressing(false);
      if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
      onEdit?.();
    }, LONG_PRESS_MS);
  }

  function movePress(e: React.PointerEvent) {
    if (!timerRef.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
      clearTimer();
      setPressing(false);
    }
  }

  function cancelPress() {
    clearTimer();
    setPressing(false);
  }

  useEffect(() => () => clearTimer(), []);

  return (
    <div
      className={[
        'bg-white rounded-2xl border px-4 py-3 shadow-sm transition-[transform,background-color,border-color] duration-150',
        pressing ? 'border-brand bg-blue-50/50 scale-[0.98]' : 'border-gray-100',
      ].join(' ')}
      onPointerDown={startPress}
      onPointerMove={movePress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-brand font-medium">
            {minutesToLabel(slot.start)} - {minutesToLabel(slot.end)}
          </span>
          <span className="text-gray-400 text-xs">
            {Math.round((slot.end - slot.start) / 6) / 10}h
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
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
      {onEdit && (
        <p className="mt-1 text-[11px] text-gray-300">长按编辑</p>
      )}
    </div>
  );
}
