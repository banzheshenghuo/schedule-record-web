import { useCallback, useEffect, useState } from 'react';
import type { DayRecord, TimeSlot } from '../types/record';
import { deleteSlot, loadRecord, upsertSlot } from '../lib/storage';

export function useRecordsByDate(date: string) {
  const [record, setRecord] = useState<DayRecord>(() => loadRecord(date));

  useEffect(() => {
    setRecord(loadRecord(date));
  }, [date]);

  const reload = useCallback(() => {
    setRecord(loadRecord(date));
  }, [date]);

  const save = useCallback(
    (slot: TimeSlot) => {
      upsertSlot(date, slot);
      reload();
    },
    [date, reload]
  );

  const remove = useCallback(
    (slotId: string) => {
      deleteSlot(date, slotId);
      reload();
    },
    [date, reload]
  );

  return { record, reload, save, remove };
}
