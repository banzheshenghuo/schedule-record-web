import { useEffect, useMemo, useState } from 'react';
import DateBar from '../components/DateBar';
import TimeSlotCard from '../components/TimeSlotCard';
import TimeGridPicker from '../components/TimeGridPicker';
import ConfirmButton from '../components/ConfirmButton';
import { useRecordsByDate } from '../hooks/useRecordsByDate';
import { toDateKey } from '../lib/date';
import { firstAvailableStart, minutesToLabel, SLOT_STEP } from '../lib/timeGrid';
import { clearDraft, getDraft, setDraft } from '../lib/draft';
import type { TimeSlot } from '../types/record';

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type Editor = {
  mode: 'create' | 'edit';
  slotId: string;
  start: number;
  end: number;
  content: string;
  idea: string;
  notes: string;
};

export default function RecordPage() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { record, save, remove } = useRecordsByDate(date);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showDraftRestore, setShowDraftRestore] = useState(false);

  useEffect(() => {
    const draftKey = `${date}#__pending__`;
    const d = getDraft(draftKey);
    if (d && d.content) {
      setShowDraftRestore(true);
    }
  }, [date]);

  const sortedSlots = useMemo(
    () => [...record.slots].sort((a, b) => b.start - a.start),
    [record.slots]
  );

  function openCreate() {
    const start = firstAvailableStart(record.slots);
    if (start < 0) {
      alert('今天没有可用时段了');
      return;
    }
    const draftKey = `${date}#__pending__`;
    const draft = getDraft(draftKey);
    setEditor({
      mode: 'create',
      slotId: uuid(),
      start: draft?.start ?? start,
      end: draft?.end ?? start + SLOT_STEP,
      content: draft?.content ?? '',
      idea: draft?.idea ?? '',
      notes: draft?.notes ?? '',
    });
  }

  function openEdit(slot: TimeSlot) {
    const draftKey = `${date}#${slot.id}`;
    const draft = getDraft(draftKey);
    setEditor({
      mode: 'edit',
      slotId: slot.id,
      start: draft?.start ?? slot.start,
      end: draft?.end ?? slot.end,
      content: draft?.content ?? slot.content,
      idea: draft?.idea ?? slot.idea ?? '',
      notes: draft?.notes ?? slot.notes ?? '',
    });
  }

  function syncDraft(next: Editor) {
    const draftKey = editor!.mode === 'create' ? `${date}#__pending__` : `${date}#${next.slotId}`;
    setDraft(draftKey, { start: next.start, end: next.end, content: next.content, idea: next.idea, notes: next.notes });
  }

  function updateEditor(patch: Partial<Editor>) {
    setEditor((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      syncDraft(next);
      return next;
    });
  }

  function handleConfirmRange(range: { start: number; end: number }) {
    updateEditor(range);
    return true;
  }

  function handleSave() {
    if (!editor) return;
    const now = Date.now();
    const existing = record.slots.find((s) => s.id === editor.slotId);
    const slot: TimeSlot = {
      id: editor.slotId,
      start: editor.start,
      end: editor.end,
      content: editor.content.trim(),
      idea: editor.idea.trim(),
      notes: editor.notes.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    save(slot);
    const draftKey =
      editor.mode === 'create' ? `${date}#__pending__` : `${date}#${editor.slotId}`;
    clearDraft(draftKey);
    setEditor(null);
  }

  function handleCancel() {
    if (!editor) return;
    const hasContent =
      editor.content.trim().length > 0 ||
      editor.start !== (editor.mode === 'create' ? 0 : 0);
    if (hasContent) {
      const ok = window.confirm('放弃当前编辑？未保存内容将作为草稿保留。');
      if (!ok) return;
    }
    setEditor(null);
  }

  function handleDelete(slot: TimeSlot) {
    if (!window.confirm('删除该时间段？')) return;
    remove(slot.id);
    clearDraft(`${date}#${slot.id}`);
  }

  return (
    <div className="min-h-full flex flex-col">
      <DateBar date={date} onChange={setDate} />
      <div className="flex-1 px-3 py-3 space-y-2 max-w-md mx-auto w-full">
        {sortedSlots.length === 0 && (
          <div className="text-center text-ink-400 dark:text-ink-500 py-16 font-mono">
            <p className="text-2xl mb-3 text-brand animate-blink">_</p>
            <p className="text-sm">No records yet</p>
            <p className="text-xs mt-1 text-ink-300 dark:text-ink-600">
              $ tap + to create a slot
            </p>
          </div>
        )}
        {sortedSlots.map((slot) => (
          <TimeSlotCard
            key={slot.id}
            slot={slot}
            onEdit={() => openEdit(slot)}
            onDelete={() => handleDelete(slot)}
          />
        ))}
      </div>

      {showDraftRestore && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 max-w-md w-[calc(100%-1.5rem)] bg-accent-amber/10 border border-accent-amber/30 text-accent-amber rounded-xl p-3 text-sm flex items-center justify-between font-mono">
          <span className="text-xs">// unsaved draft detected</span>
          <div className="flex gap-2">
            <button
              className="text-accent-amber text-xs font-medium"
              onClick={() => {
                openCreate();
                setShowDraftRestore(false);
              }}
            >
              restore
            </button>
            <button
              className="text-ink-400 text-xs"
              onClick={() => {
                clearDraft(`${date}#__pending__`);
                setShowDraftRestore(false);
              }}
            >
              discard
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-14 inset-x-0 z-20 max-w-md mx-auto px-4 pb-2">
        <button
          onClick={openCreate}
          className="absolute right-4 bottom-2 w-14 h-14 rounded-xl bg-brand text-ink-950 text-2xl font-mono font-bold shadow-lg shadow-brand/20 active:bg-brand-dark active:scale-95 gk-border-glow"
          aria-label="添加时间段"
        >
          +
        </button>
      </div>

      {editor && (
        <EditorSheet
          editor={editor}
          slots={record.slots.filter((s) => s.id !== editor.slotId)}
          onChange={updateEditor}
          onSave={handleSave}
          onCancel={handleCancel}
          onPickRange={handleConfirmRange}
        />
      )}
    </div>
  );
}

interface EditorSheetProps {
  editor: Editor;
  slots: TimeSlot[];
  onChange: (patch: Partial<Editor>) => void;
  onSave: () => void;
  onCancel: () => void;
  onPickRange: (range: { start: number; end: number }) => boolean;
}

function EditorSheet({
  editor,
  slots,
  onChange,
  onSave,
  onCancel,
  onPickRange,
}: EditorSheetProps) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="关闭"
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-white dark:bg-ink-850 rounded-t-2xl px-4 pt-4 border-t-2 border-brand/30"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="flex items-center justify-between mb-3 font-mono">
          <button className="text-ink-400 dark:text-ink-400 text-sm" onClick={onCancel}>
            esc
          </button>
          <span className="font-medium text-ink-900 dark:text-ink-100 text-sm">
            {editor.mode === 'create' ? 'new slot' : 'edit slot'}
          </span>
          <button className="text-brand font-medium text-sm" onClick={onSave}>
            save
          </button>
        </div>
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-ink-50 dark:bg-ink-800 rounded-xl mb-3 border border-ink-100 dark:border-ink-700"
          onClick={() => setShowPicker(true)}
        >
          <span className="text-ink-400 dark:text-ink-400 text-sm font-mono">{'// time'}</span>
          <span className="text-ink-900 dark:text-ink-100 text-sm font-medium font-mono">
            {minutesToLabel(editor.start)}–{minutesToLabel(editor.end)}
          </span>
        </button>
        <textarea
          className="w-full min-h-[140px] p-3 bg-ink-50 dark:bg-ink-800 dark:text-ink-100 dark:placeholder-ink-600 rounded-xl text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-ink-100 dark:border-ink-700"
          placeholder="这段时间做了什么..."
          value={editor.content}
          onChange={(e) => onChange({ content: e.target.value })}
          autoFocus
        />
        <textarea
          className="w-full min-h-[80px] mt-3 p-3 bg-accent-amber/5 dark:bg-accent-amber/10 dark:text-accent-amber/90 dark:placeholder-accent-amber/40 rounded-xl text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent-amber/30 border border-accent-amber/20 dark:border-accent-amber/20"
          placeholder="// 有什么想法..."
          value={editor.idea}
          onChange={(e) => onChange({ idea: e.target.value })}
        />
        <textarea
          className="w-full min-h-[80px] mt-3 p-3 bg-ink-100/60 dark:bg-ink-700/40 dark:text-ink-200 dark:placeholder-ink-500 rounded-xl text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ink-400/30 border border-ink-200 dark:border-ink-600 font-mono"
          placeholder="// 电话号码、备忘事项..."
          value={editor.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
        <div className="flex gap-2 mt-3">
          <ConfirmButton variant="ghost" className="flex-1" onClick={onCancel}>
            cancel
          </ConfirmButton>
          <ConfirmButton className="flex-1" onClick={onSave}>
            save
          </ConfirmButton>
        </div>
      </div>

      {showPicker && (
        <TimeGridPicker
          slots={slots}
          initialStart={editor.start}
          initialEnd={editor.end}
          onConfirm={(range) => {
            const ok = onPickRange(range);
            if (ok) setShowPicker(false);
            return ok;
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
