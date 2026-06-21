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
const SWIPE_OPEN = -76;
const SWIPE_TRIGGER = -24;

export default function TimeSlotCard({ slot, onEdit, onDelete }: Props) {
  const timerRef = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const swiping = useRef(false);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(true);
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
    startOffset.current = offset;
    swiping.current = false;
    setAnimate(false);
    setPressing(true);
    timerRef.current = window.setTimeout(() => {
      if (!swiping.current) {
        setPressing(false);
        if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
        onEdit?.();
      }
    }, LONG_PRESS_MS);
  }

  function movePress(e: React.PointerEvent) {
    if (!timerRef.current && !swiping.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!swiping.current) {
      // 水平移动占主导时切换为滑动模式，取消长按
      if (Math.abs(dx) > MOVE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        swiping.current = true;
        clearTimer();
        setPressing(false);
      } else if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
        clearTimer();
        setPressing(false);
      }
    }

    if (swiping.current) {
      const next = startOffset.current + dx;
      setOffset(Math.min(0, Math.max(SWIPE_OPEN, next)));
    }
  }

  function endPress() {
    clearTimer();
    setPressing(false);
    setAnimate(true);
    if (swiping.current) {
      swiping.current = false;
      setOffset((prev) => (prev < SWIPE_TRIGGER ? SWIPE_OPEN : 0));
    }
  }

  useEffect(() => () => clearTimer(), []);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* 左滑露出的删除按钮 */}
      {onDelete && (
        <button
          className="absolute right-0 top-0 bottom-0 w-[76px] bg-red-500 text-white flex flex-col items-center justify-center text-xs font-medium active:bg-red-600"
          onClick={onDelete}
          aria-label="删除"
        >
          <span className="text-lg leading-none mb-1">🗑</span>
          删除
        </button>
      )}
      <div
        className={[
          'relative bg-white dark:bg-zinc-800 rounded-2xl border px-4 py-3 shadow-sm',
          'border-gray-100 dark:border-zinc-700',
          pressing ? '!border-brand !bg-blue-50/50 dark:!bg-blue-900/20 scale-[0.98]' : '',
        ].join(' ')}
        style={{
          transform: `translateX(${offset}px)`,
          transition: animate ? 'transform 200ms ease, background-color 150ms, border-color 150ms' : 'background-color 150ms, border-color 150ms',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
        onPointerDown={startPress}
        onPointerMove={movePress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-brand dark:text-blue-300 font-medium">
              {minutesToLabel(slot.start)} - {minutesToLabel(slot.end)}
            </span>
            <span className="text-gray-400 dark:text-zinc-500 text-xs">
              {(slot.end - slot.start) / 60}h
            </span>
          </div>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-800 dark:text-zinc-100 whitespace-pre-wrap break-words line-clamp-5">
          {slot.content.trim() || <span className="text-gray-300 dark:text-zinc-600">（无内容）</span>}
        </p>
        {onEdit && (
          <p className="mt-1 text-[11px] text-gray-300 dark:text-zinc-600">长按编辑 · 左滑删除</p>
        )}
      </div>
    </div>
  );
}
