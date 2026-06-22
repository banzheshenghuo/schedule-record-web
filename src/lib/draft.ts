export function initDraftCache() {
  if (!window.__SCHEDULE_DRAFT__) {
    window.__SCHEDULE_DRAFT__ = {};
  }
}

export function getDraft(key: string) {
  return window.__SCHEDULE_DRAFT__?.[key];
}

export function setDraft(key: string, entry: { start: number; end: number; content: string; idea?: string }) {
  if (!window.__SCHEDULE_DRAFT__) window.__SCHEDULE_DRAFT__ = {};
  window.__SCHEDULE_DRAFT__[key] = { ...entry, updatedAt: Date.now() };
}

export function clearDraft(key: string) {
  if (window.__SCHEDULE_DRAFT__) {
    delete window.__SCHEDULE_DRAFT__[key];
  }
}

export function clearDraftsByDate(date: string) {
  if (!window.__SCHEDULE_DRAFT__) return;
  const prefix = `${date}#`;
  for (const key of Object.keys(window.__SCHEDULE_DRAFT__)) {
    if (key.startsWith(prefix)) delete window.__SCHEDULE_DRAFT__[key];
  }
}

export function hasAnyDraft(): boolean {
  if (!window.__SCHEDULE_DRAFT__) return false;
  return Object.keys(window.__SCHEDULE_DRAFT__).length > 0;
}
