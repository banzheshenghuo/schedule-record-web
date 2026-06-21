export interface TimeSlot {
  id: string;
  start: number; // 当天分钟数 0-1439，30 的倍数
  end: number; // 排他结束，> start，<=1440
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  slots: TimeSlot[];
}

export interface DraftEntry {
  start: number;
  end: number;
  content: string;
  updatedAt: number;
}

declare global {
  interface Window {
    __SCHEDULE_DRAFT__?: Record<string, DraftEntry>; // key: `${date}#${slotId}`
  }
}
