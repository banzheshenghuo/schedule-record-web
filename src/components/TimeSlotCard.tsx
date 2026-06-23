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
    <div className="relative overflow-hidden rounded-xl">
      {/* 左滑露出的删除按钮 */}
      {onDelete && (
        <button
          className="absolute right-0 top-0 bottom-0 w-[76px] bg-accent-coral text-white flex flex-col items-center justify-center text-xs font-medium active:bg-accent-coral/80 font-mono"
          onClick={onDelete}
          aria-label="删除"
        >
          <span className="text-lg leading-none mb-1">rm</span>
        </button>
      )}
      <div
        className={[
          'relative bg-white dark:bg-ink-850 rounded-xl border px-4 py-3',
          'border-ink-100 dark:border-ink-700',
          pressing ? '!border-brand !bg-brand/5 dark:!bg-brand/5 scale-[0.98] gk-border-glow' : '',
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
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-brand/10 dark:bg-brand/15 text-brand font-mono text-xs font-medium tracking-tight">
              {minutesToLabel(slot.start)}–{minutesToLabel(slot.end)}
            </span>
            <span className="text-ink-400 dark:text-ink-500 text-[11px] font-mono">
              {((slot.end - slot.start) / 60).toFixed(1)}h
            </span>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <p className="text-[15px] leading-relaxed text-ink-800 dark:text-ink-100 whitespace-pre-wrap break-words line-clamp-5">
            {slot.content.trim() || <span className="text-ink-300 dark:text-ink-600 font-mono text-sm">// no content</span>}
          </p>
          {slot.idea?.trim() && (
            <div className="rounded-lg bg-accent-amber/5 dark:bg-accent-amber/10 border-l-2 border-accent-amber dark:border-accent-amber/60 px-3 py-2 text-[13px] leading-relaxed text-ink-700 dark:text-accent-amber/90">
              <span className="font-mono text-accent-amber text-xs mr-1">{'// idea'}</span>
              {slot.idea.trim()}
            </div>
          )}
        </div>
        {onEdit && (
          <p className="mt-1.5 text-[10px] text-ink-300 dark:text-ink-600 font-mono tracking-wide">
            long-press: edit · swipe-left: delete
          </p>
        )}
      </div>
    </div>
  );
}
