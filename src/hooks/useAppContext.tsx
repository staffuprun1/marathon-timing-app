"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addRecord,
  deleteAllRecords,
  deleteRecord,
  getAllRecords,
  getSettings,
  saveAllRecords,
  saveSettings,
  updateRecord,
} from "@/lib/db";
import { detectEventFromBib } from "@/lib/bib-event";
import type { AppSettings, TimingRecord } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import {
  createRecord,
  feedbackRecord,
  reorderRanks,
  speakRecord,
} from "@/lib/record-utils";

interface AppContextValue {
  settings: AppSettings;
  records: TimingRecord[];
  loading: boolean;
  bibInput: string;
  setBibInput: (v: string) => void;
  flash: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  recordEntry: () => Promise<TimingRecord | null>;
  photoRecordEntry: () => Promise<TimingRecord | null>;
  undoLast: () => Promise<void>;
  clearAllRecords: () => Promise<void>;
  editRecord: (record: TimingRecord) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  reorderRecords: (records: TimingRecord[]) => Promise<void>;
  refreshAll: () => Promise<void>;
  registerPhotoCapture: (fn: () => string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<TimingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bibInput, setBibInput] = useState("");
  const [flash, setFlash] = useState(false);
  const settingsRef = useRef(settings);
  const recordsRef = useRef(records);
  const capturePhotoRef = useRef<(() => string | null) | null>(null);

  settingsRef.current = settings;
  recordsRef.current = records;

  const triggerFlash = useCallback(() => {
    setFlash(true);
    feedbackRecord();
    setTimeout(() => setFlash(false), 180);
  }, []);

  const registerPhotoCapture = useCallback((fn: () => string | null) => {
    capturePhotoRef.current = fn;
  }, []);

  useEffect(() => {
    async function init() {
      const s = await getSettings();
      setSettings(s);
      setRecords(await getAllRecords());
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible") {
        getAllRecords().then(setRecords);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...partial };
    setSettings(next);
    await saveSettings(next);
  }, []);

  const saveNewRecord = useCallback(
    async (record: TimingRecord) => {
      await addRecord(record);
      const updated = [...recordsRef.current, record].sort((a, b) => a.rank - b.rank);
      setRecords(updated);
      setBibInput("");
      speakRecord(record.bibNumber, record.rank, settingsRef.current.voiceEnabled);
      triggerFlash();
      return record;
    },
    [triggerFlash]
  );

  const resolveBib = useCallback((): string | null => {
    const s = settingsRef.current;
    const bib = bibInput.trim() || null;
    if (!bib && !s.congestionMode) return null;
    return bib;
  }, [bibInput]);

  const recordEntry = useCallback(async (): Promise<TimingRecord | null> => {
    const bib = resolveBib();
    if (bib === null && !settingsRef.current.congestionMode) return null;
    const record = createRecord(settingsRef.current, recordsRef.current, bib);
    return saveNewRecord(record);
  }, [resolveBib, saveNewRecord]);

  const photoRecordEntry = useCallback(async (): Promise<TimingRecord | null> => {
    const bib = resolveBib();
    if (bib === null && !settingsRef.current.congestionMode) return null;
    const thumb = capturePhotoRef.current?.() ?? undefined;
    const record = createRecord(
      settingsRef.current,
      recordsRef.current,
      bib,
      thumb ?? undefined
    );
    return saveNewRecord(record);
  }, [resolveBib, saveNewRecord]);

  const undoLast = useCallback(async () => {
    const current = recordsRef.current;
    if (current.length === 0) return;
    const last = current.reduce((a, b) => (a.rank > b.rank ? a : b));
    await deleteRecord(last.id);
    const remaining = current.filter((r) => r.id !== last.id);
    const reordered = reorderRanks(remaining);
    await saveAllRecords(reordered);
    setRecords(reordered);
    feedbackRecord();
  }, []);

  const clearAllRecords = useCallback(async () => {
    if (!confirm("本当に削除しますか？\n削除後は復元不可")) return;
    await deleteAllRecords();
    setRecords([]);
  }, []);

  const editRecord = useCallback(async (record: TimingRecord) => {
    await updateRecord(record);
    setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  }, []);

  const removeRecord = useCallback(async (id: string) => {
    await deleteRecord(id);
    const remaining = recordsRef.current.filter((r) => r.id !== id);
    const reordered = reorderRanks(remaining);
    await saveAllRecords(reordered);
    setRecords(reordered);
  }, []);

  const reorderRecords = useCallback(async (newRecords: TimingRecord[]) => {
    const reordered = reorderRanks(newRecords);
    await saveAllRecords(reordered);
    setRecords(reordered);
  }, []);

  const refreshAll = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    setRecords(await getAllRecords());
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        records,
        loading,
        bibInput,
        setBibInput,
        flash,
        updateSettings,
        recordEntry,
        photoRecordEntry,
        undoLast,
        clearAllRecords,
        editRecord,
        removeRecord,
        reorderRecords,
        refreshAll,
        registerPhotoCapture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
