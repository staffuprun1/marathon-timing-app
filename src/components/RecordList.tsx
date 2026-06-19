"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "@/hooks/useAppContext";
import type { RecordStatus, TimingRecord } from "@/lib/types";
import { formatElapsedShort, formatRecordTime, parseElapsedToMs } from "@/lib/time";

function SortableRow({
  record,
  onEdit,
}: {
  record: TimingRecord;
  onEdit: (r: TimingRecord) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: record.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusLabel =
    record.status === "dnf" ? "DNF" : record.status === "dns" ? "DNS" : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-3 border-b border-gray-800 bg-gray-950 hover:bg-gray-900"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 px-1 touch-manipulation cursor-grab active:cursor-grabbing"
        aria-label="並び替え"
      >
        ☰
      </button>
      <span className="w-10 text-center font-bold text-emerald-400 text-lg">
        {record.rank}
      </span>
      <span className="w-16 text-center font-mono text-white text-lg">
        {record.bibNumber ?? "—"}
      </span>
      <span className="flex-1 font-mono text-white text-lg">
        {statusLabel ?? formatElapsedShort(record.elapsedMs)}
      </span>
      <span className="text-xs text-gray-500 w-16 text-right">
        {formatRecordTime(record.recordedAt)}
      </span>
      <button
        onClick={() => onEdit(record)}
        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm touch-manipulation"
      >
        編集
      </button>
    </div>
  );
}

function EditModal({
  record,
  onClose,
}: {
  record: TimingRecord;
  onClose: () => void;
}) {
  const { editRecord, removeRecord } = useApp();
  const [rank, setRank] = useState(String(record.rank));
  const [bib, setBib] = useState(record.bibNumber ?? "");
  const [time, setTime] = useState(formatElapsedShort(record.elapsedMs));
  const [status, setStatus] = useState<RecordStatus>(record.status);

  async function handleSave() {
    const elapsedMs =
      status === "finished" ? (parseElapsedToMs(time) ?? record.elapsedMs) : record.elapsedMs;

    await editRecord({
      ...record,
      rank: parseInt(rank, 10) || record.rank,
      bibNumber: bib.trim() || null,
      elapsedMs,
      status,
    });
    onClose();
  }

  async function handleDelete() {
    if (confirm("この記録を削除しますか？")) {
      await removeRecord(record.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md p-5 space-y-4 border border-gray-700">
        <h3 className="text-xl font-bold text-white">記録編集</h3>

        <label className="block">
          <span className="text-xs text-gray-400">順位</span>
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white text-xl font-mono"
          />
        </label>

        <label className="block">
          <span className="text-xs text-gray-400">ゼッケン</span>
          <input
            type="text"
            inputMode="numeric"
            value={bib}
            onChange={(e) => setBib(e.target.value.replace(/\D/g, ""))}
            placeholder="未入力"
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white text-xl font-mono"
          />
        </label>

        <label className="block">
          <span className="text-xs text-gray-400">タイム</span>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={status !== "finished"}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white text-xl font-mono disabled:opacity-50"
          />
        </label>

        <div className="flex gap-2">
          {(["finished", "dnf", "dns"] as RecordStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                status === s
                  ? s === "finished"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {s === "finished" ? "完走" : s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl"
          >
            保存
          </button>
          <button
            onClick={handleDelete}
            className="px-4 bg-red-900/50 hover:bg-red-800 text-red-300 font-bold py-3 rounded-xl"
          >
            削除
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecordList() {
  const { records, reorderRecords } = useApp();
  const [editing, setEditing] = useState<TimingRecord | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = records.findIndex((r) => r.id === active.id);
    const newIndex = records.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...records];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderRecords(reordered);
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-800">
        <h2 className="font-bold text-white">
          記録一覧
          <span className="ml-2 text-emerald-400">{records.length}件</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {records.length === 0 ? (
          <div className="text-center text-gray-500 py-12">記録がありません</div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 border-b border-gray-800">
              <span className="w-6" />
              <span className="w-10 text-center">順位</span>
              <span className="w-16 text-center">ゼッケン</span>
              <span className="flex-1">タイム</span>
              <span className="w-16 text-right">時刻</span>
              <span className="w-14" />
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={records.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                {records.map((record) => (
                  <SortableRow key={record.id} record={record} onEdit={setEditing} />
                ))}
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>

      {editing && <EditModal record={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
