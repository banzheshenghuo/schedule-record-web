import type { DayRecord, TimeSlot } from '../types/record';

const KEY_PREFIX = 'schedule-record:';
const INDEX_KEY = 'schedule-record:__index__';

function keyOf(date: string) {
  return `${KEY_PREFIX}${date}`;
}

export function loadRecord(date: string): DayRecord {
  try {
    const raw = localStorage.getItem(keyOf(date));
    if (!raw) return { date, slots: [] };
    const parsed = JSON.parse(raw) as DayRecord;
    if (parsed && Array.isArray(parsed.slots)) {
      return { date, slots: parsed.slots };
    }
    return { date, slots: [] };
  } catch {
    return { date, slots: [] };
  }
}

export function saveRecord(record: DayRecord) {
  localStorage.setItem(keyOf(record.date), JSON.stringify(record));
  updateIndex(record.date, record.slots.length > 0);
}

export function deleteSlot(date: string, slotId: string) {
  const record = loadRecord(date);
  record.slots = record.slots.filter((s) => s.id !== slotId);
  saveRecord(record);
}

export function upsertSlot(date: string, slot: TimeSlot) {
  const record = loadRecord(date);
  const idx = record.slots.findIndex((s) => s.id === slot.id);
  if (idx >= 0) record.slots[idx] = slot;
  else record.slots.push(slot);
  record.slots.sort((a, b) => a.start - b.start);
  saveRecord(record);
}

function updateIndex(date: string, hasSlots: boolean) {
  let index: string[] = [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) index = JSON.parse(raw) as string[];
  } catch {
    index = [];
  }
  const set = new Set(index);
  if (hasSlots) set.add(date);
  else set.delete(date);
  localStorage.setItem(INDEX_KEY, JSON.stringify([...set].sort()));
}

export function getRecordedDates(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
