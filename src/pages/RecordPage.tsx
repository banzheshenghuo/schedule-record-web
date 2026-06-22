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
};

export default function RecordPage() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { record, save, remove } = useRecordsByDate(date);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showDraftRestore, setShowDraftRestore] = useState(false);

  // 进入页面时检测是否有当前日期草稿
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
    });
  }

  function syncDraft(next: Editor) {
    const draftKey = editor!.mode === 'create' ? `${date}#__pending__` : `${date}#${next.slotId}`;
    setDraft(draftKey, { start: next.start, end: next.end, content: next.content });
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
          <div className="text-center text-gray-400 dark:text-zinc-500 py-16">
            <p className="text-3xl mb-2">🗂️</p>
            <p>今天还没有记录</p>
            <p className="text-xs mt-1">点击下方 + 添加时间段</p>
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
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-30 max-w-md w-[calc(100%-1.5rem)] bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm flex items-center justify-between">
          <span>检测到未保存草稿</span>
          <div className="flex gap-2">
            <button
              className="text-amber-700"
              onClick={() => {
                openCreate();
                setShowDraftRestore(false);
              }}
            >
              恢复
            </button>
            <button
              className="text-amber-700"
              onClick={() => {
                clearDraft(`${date}#__pending__`);
                setShowDraftRestore(false);
              }}
            >
              丢弃
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-14 inset-x-0 z-20 max-w-md mx-auto px-4 pb-2">
        <button
          onClick={openCreate}
          className="absolute right-4 bottom-2 w-14 h-14 rounded-full bg-brand text-white text-2xl shadow-lg active:bg-brand-dark active:scale-95"
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
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div
        className="relative bg-white dark:bg-zinc-800 rounded-t-2xl px-4 pt-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <button className="text-gray-500 dark:text-zinc-400 text-sm" onClick={onCancel}>
            取消
          </button>
          <span className="font-medium text-gray-900 dark:text-zinc-100">编辑时间段</span>
          <button className="text-brand font-medium text-sm" onClick={onSave}>
            保存
          </button>
        </div>
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-700/50 rounded-xl mb-3"
          onClick={() => setShowPicker(true)}
        >
          <span className="text-gray-500 dark:text-zinc-400 text-sm">时间</span>
          <span className="text-gray-900 dark:text-zinc-100 text-sm font-medium">
            {minutesToLabel(editor.start)} - {minutesToLabel(editor.end)}
          </span>
        </button>
        <textarea
          className="w-full min-h-[140px] p-3 bg-gray-50 dark:bg-zinc-700/50 dark:text-zinc-100 dark:placeholder-zinc-500 rounded-xl text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="这段时间做了什么..."
          value={editor.content}
          onChange={(e) => onChange({ content: e.target.value })}
          autoFocus
        />
        <textarea
          className="w-full min-h-[80px] mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-100 dark:placeholder-amber-500/60 rounded-xl text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
          placeholder="💡 有什么想法..."
          value={editor.idea}
          onChange={(e) => onChange({ idea: e.target.value })}
        />
        <div className="flex gap-2 mt-3">
          <ConfirmButton variant="ghost" className="flex-1" onClick={onCancel}>
            取消
          </ConfirmButton>
          <ConfirmButton className="flex-1" onClick={onSave}>
            保存
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
