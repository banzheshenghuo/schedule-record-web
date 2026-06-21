import type { TimeSlot } from '../types/record';

export const SLOT_STEP = 30;
export const MINUTES_PER_DAY = 1440;

export function isOverlap(a: { start: number; end: number }, b: { start: number; end: number }) {
  return a.start < b.end && b.start < a.end;
}

export function canPlace(slots: TimeSlot[], candidate: { start: number; end: number; id?: string }) {
  if (candidate.start < 0) return false;
  if (candidate.end > MINUTES_PER_DAY) return false;
  if (candidate.end <= candidate.start) return false;
  if (candidate.start % SLOT_STEP !== 0) return false;
  if (candidate.end % SLOT_STEP !== 0) return false;
  return !slots.some(
    (s) => (!candidate.id || s.id !== candidate.id) && isOverlap(s, candidate)
  );
}

export interface Range {
  start: number;
  end: number;
}

export function getAvailableRanges(slots: TimeSlot[]): Range[] {
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  const ranges: Range[] = [];
  let cursor = 0;
  for (const s of sorted) {
    if (s.start > cursor) ranges.push({ start: cursor, end: s.start });
    cursor = Math.max(cursor, s.end);
  }
  if (cursor < MINUTES_PER_DAY) ranges.push({ start: cursor, end: MINUTES_PER_DAY });
  return ranges;
}

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isCellOccupied(slots: TimeSlot[], cellStart: number): boolean {
  const cellEnd = cellStart + SLOT_STEP;
  return slots.some((s) => s.start < cellEnd && cellStart < s.end);
}

export function firstAvailableStart(slots: TimeSlot[], now = new Date()): number {
  const startOfNow = now.getHours() * 60 + now.getMinutes();
  const floored = Math.floor(startOfNow / SLOT_STEP) * SLOT_STEP;
  for (let off = 0; off < MINUTES_PER_DAY; off += SLOT_STEP) {
    const start = (floored + off) % MINUTES_PER_DAY;
    if (canPlace(slots, { start, end: start + SLOT_STEP })) return start;
  }
  // fallback
  for (let start = 0; start < MINUTES_PER_DAY; start += SLOT_STEP) {
    if (canPlace(slots, { start, end: start + SLOT_STEP })) return start;
  }
  return -1;
}
