import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MINUTES_PER_DAY,
  SLOT_STEP,
  canPlace,
  isCellOccupied,
  minutesToLabel,
} from '../lib/timeGrid';
import type { TimeSlot } from '../types/record';

interface Props {
  slots: TimeSlot[];
  initialStart: number;
  initialEnd: number;
  onConfirm: (range: { start: number; end: number }) => boolean;
  onCancel: () => void;
}

const CELL_COUNT = MINUTES_PER_DAY / SLOT_STEP;
const CELL_HEIGHT = 36;

function minutesToCell(min: number) {
  return Math.round(min / SLOT_STEP);
}

export default function TimeGridPicker({
  slots,
  initialStart,
  initialEnd,
  onConfirm,
  onCancel,
}: Props) {
  const [startCell, setStartCell] = useState(() => minutesToCell(initialStart));
  const [endCell, setEndCell] = useState(() => minutesToCell(initialEnd));
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'start' | 'end' | null>(null);

  const occupiedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < CELL_COUNT; i++) {
      if (isCellOccupied(slots, i * SLOT_STEP)) s.add(i);
    }
    return s;
  }, [slots]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const targetTop = startCell * CELL_HEIGHT;
    const targetCenter = targetTop - el.clientHeight / 2 + CELL_HEIGHT / 2;
    el.scrollTo({
      top: Math.max(0, Math.min(el.scrollHeight - el.clientHeight, targetCenter)),
      behavior: 'instant',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = startCell * SLOT_STEP;
  const end = endCell * SLOT_STEP;
  const canSave = canPlace(slots, { start, end });

  function cellFromY(clientY: number): number {
    const el = cellsRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const idx = Math.floor(y / CELL_HEIGHT);
    return Math.max(0, Math.min(CELL_COUNT - 1, idx));
  }

  function handlePointerDown(target: 'start' | 'end') {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = target;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const idx = cellFromY(e.clientY);
    if (dragging.current === 'start') {
      if (idx < endCell && !occupiedSet.has(idx)) setStartCell(idx);
    } else {
      if (idx + 1 > startCell) {
        let blocked = false;
        for (let i = startCell; i <= idx; i++) {
          if (occupiedSet.has(i)) {
            blocked = true;
            break;
          }
        }
        if (!blocked) setEndCell(idx + 1);
      }
    }
  }

  function handlePointerUp() {
    dragging.current = null;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

  function handleConfirm() {
    if (!canPlace(slots, { start, end })) {
      setError('该时段不可用，请重新选择');
      return;
    }
    const ok = onConfirm({ start, end });
    if (!ok) setError('保存失败，时段冲突');
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="关闭"
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-ink-850 rounded-t-2xl max-h-[80vh] flex flex-col border-t-2 border-brand/30">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700 font-mono">
          <button className="text-ink-400 dark:text-ink-400 text-sm" onClick={onCancel}>
            esc
          </button>
          <span className="font-medium text-ink-900 dark:text-ink-100 text-sm">
            select_range
          </span>
          <button
            className="text-brand text-sm font-medium disabled:opacity-40"
            disabled={!canSave}
            onClick={handleConfirm}
          >
            ok
          </button>
        </div>

        <div className="px-4 pt-3 text-sm text-ink-500 dark:text-ink-400 font-mono">
          <span className="text-ink-400">{'// selected: '}</span>
          <span className="text-ink-900 dark:text-ink-100 font-medium">
            {minutesToLabel(start)}–{minutesToLabel(end)}
          </span>
          <span className="ml-2 text-ink-400 text-xs">
            {((end - start) / 60).toFixed(1)}h
          </span>
        </div>

        <div
          ref={gridRef}
          className="relative flex-1 overflow-y-auto no-scrollbar px-4 py-2 overscroll-contain select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            userSelect: 'none',
          }}
        >
          {/* 选中区间高亮 */}
          {startCell < endCell && (
            <div
              className="absolute left-4 right-4 bg-brand/10 dark:bg-brand/10 border-l-2 border-brand rounded-md pointer-events-none"
              style={{
                top: startCell * CELL_HEIGHT + 8,
                height: (endCell - startCell) * CELL_HEIGHT,
              }}
            />
          )}
          {/* 起始手柄 */}
          <div
            onPointerDown={handlePointerDown('start')}
            className="absolute left-4 right-4 z-10 h-8 -mt-4 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              top: startCell * CELL_HEIGHT + 8 + 4,
              transform: 'translateY(-50%)',
              touchAction: 'none',
            }}
          >
            <div className="w-full h-6 rounded-md bg-brand text-ink-950 text-xs flex items-center justify-between px-3 font-mono font-medium shadow-md shadow-brand/20">
              <span>start {minutesToLabel(start)}</span>
              <span className="opacity-50">::</span>
            </div>
          </div>
          {/* 结束手柄 */}
          <div
            onPointerDown={handlePointerDown('end')}
            className="absolute left-4 right-4 z-10 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              top: endCell * CELL_HEIGHT + 8,
              transform: 'translateY(-50%)',
              touchAction: 'none',
            }}
          >
            <div className="w-full h-6 rounded-md bg-brand-dark text-white text-xs flex items-center justify-between px-3 font-mono font-medium shadow-md shadow-brand/20">
              <span>end {minutesToLabel(end)}</span>
              <span className="opacity-50">::</span>
            </div>
          </div>

          {/* 网格 */}
          <div ref={cellsRef} className="relative font-mono">
            {Array.from({ length: CELL_COUNT }, (_, i) => {
              const occupied = occupiedSet.has(i);
              const min = i * SLOT_STEP;
              const nextMin = (i + 1) * SLOT_STEP;
              return (
                <div
                  key={i}
                  data-index={i}
                  className="flex items-center border-b border-ink-50 dark:border-ink-700/40"
                  style={{ height: CELL_HEIGHT }}
                >
                  <div
                    className={[
                      'w-16 text-xs',
                      occupied
                        ? 'text-ink-300 dark:text-ink-600 line-through'
                        : 'text-ink-500 dark:text-ink-400',
                    ].join(' ')}
                  >
                    {minutesToLabel(min)}
                  </div>
                  <div
                    className={[
                      'flex-1 text-xs',
                      occupied
                        ? 'text-ink-300 dark:text-ink-600'
                        : 'text-ink-400 dark:text-ink-500',
                    ].join(' ')}
                  >
                    {occupied ? '[locked]' : `→ ${minutesToLabel(nextMin)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-accent-coral dark:text-accent-coral bg-accent-coral/10 border-t border-accent-coral/20 font-mono">
            {'> error: '}{error}
          </div>
        )}
        <div
          className="px-4 py-3 border-t border-ink-100 dark:border-ink-700"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <p className="text-xs text-ink-400 dark:text-ink-500 mb-2 font-mono">
            {'// drag handles to adjust range'}
          </p>
          <button
            className="w-full h-11 rounded-xl bg-brand text-ink-950 font-medium font-mono active:bg-brand-dark disabled:opacity-40 transition-all active:scale-[0.98] gk-border-glow"
            disabled={!canSave}
            onClick={handleConfirm}
          >
            confirm
          </button>
        </div>
      </div>
    </div>
  );
}
