import { useMemo, useRef, useState } from 'react';
import {
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

const CELL_COUNT = 48; // 48 * 30 = 1440
const CELL_HEIGHT = 44;

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
  const dragging = useRef<'start' | 'end' | null>(null);

  const occupiedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < CELL_COUNT; i++) {
      if (isCellOccupied(slots, i * SLOT_STEP)) s.add(i);
    }
    return s;
  }, [slots]);

  const start = startCell * SLOT_STEP;
  const end = endCell * SLOT_STEP;
  const canSave = canPlace(slots, { start, end });

  function cellFromY(clientY: number): number {
    const el = gridRef.current;
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
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const idx = cellFromY(e.clientY);
    if (dragging.current === 'start') {
      if (idx < endCell && !occupiedSet.has(idx)) setStartCell(idx);
    } else {
      // end handle: index+1 is the end cell
      if (idx + 1 > startCell) {
        // check no occupied cell in range [startCell, idx]
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
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button className="text-gray-500 text-sm" onClick={onCancel}>
            取消
          </button>
          <span className="font-medium text-gray-900">选择时间段</span>
          <button
            className="text-brand text-sm font-medium disabled:opacity-40"
            disabled={!canSave}
            onClick={handleConfirm}
          >
            确定
          </button>
        </div>

        <div className="px-4 pt-3 text-sm text-gray-600">
          已选：
          <span className="text-gray-900 font-medium">
            {minutesToLabel(start)} - {minutesToLabel(end)}
          </span>
          <span className="ml-2 text-gray-400 text-xs">
            {(end - start) / 60} 小时
          </span>
        </div>

        <div
          ref={gridRef}
          className="relative flex-1 overflow-y-auto no-scrollbar px-4 py-2 overscroll-contain"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* 选中区间高亮 */}
          {startCell < endCell && (
            <div
              className="absolute left-4 right-4 bg-blue-100/60 border-l-4 border-brand rounded-md pointer-events-none"
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
            <div className="w-full h-6 rounded-full bg-brand text-white text-xs flex items-center justify-between px-3 shadow">
              <span>起 {minutesToLabel(start)}</span>
              <span className="opacity-70">⋮⋮</span>
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
            <div className="w-full h-6 rounded-full bg-brand-dark text-white text-xs flex items-center justify-between px-3 shadow">
              <span>止 {minutesToLabel(end)}</span>
              <span className="opacity-70">⋮⋮</span>
            </div>
          </div>

          {/* 网格 */}
          <div className="relative">
            {Array.from({ length: CELL_COUNT }, (_, i) => {
              const occupied = occupiedSet.has(i);
              const min = i * SLOT_STEP;
              const nextMin = (i + 1) * SLOT_STEP;
              return (
                <div
                  key={i}
                  data-index={i}
                  className="flex items-center border-b border-gray-50"
                  style={{ height: CELL_HEIGHT }}
                >
                  <div
                    className={[
                      'w-16 text-xs',
                      occupied ? 'text-gray-300' : 'text-gray-500',
                    ].join(' ')}
                  >
                    {minutesToLabel(min)}
                  </div>
                  <div
                    className={[
                      'flex-1 text-xs',
                      occupied ? 'text-gray-300' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {occupied ? '占用' : `至 ${minutesToLabel(nextMin)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100">
            {error}
          </div>
        )}
        <div
          className="px-4 py-3 border-t border-gray-100"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <p className="text-xs text-gray-400 mb-2">长按上/下手柄拖动调整范围</p>
          <button
            className="w-full h-11 rounded-xl bg-brand text-white font-medium active:bg-brand-dark disabled:opacity-40"
            disabled={!canSave}
            onClick={handleConfirm}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
