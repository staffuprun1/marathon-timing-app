"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  addRecord,
  deleteRecord,
  getRecords,
  getSettings,
  saveAllRecords,
  saveSettings,
  updateRecord,
} from "@/lib/db";
import type { AppSettings, TimingRecord } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { createRecord, reorderRanks, speakRecord } from "@/lib/record-utils";

interface AppContextValue {
  settings: AppSettings;
  records: TimingRecord[];
  loading: boolean;
  bibInput: string;
  setBibInput: (v: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  recordEntry: (bibOverride?: string | null) => Promise<TimingRecord | null>;
  editRecord: (record: TimingRecord) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  reorderRecords: (records: TimingRecord[]) => Promise<void>;
  refreshRecords: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [records, setRecords] = useState<TimingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bibInput, setBibInput] = useState("");
  const settingsRef = useRef(settings);
  const recordsRef = useRef(records);

  settingsRef.current = settings;
  recordsRef.current = records;

  const refreshRecords = useCallback(async () => {
    const s = settingsRef.current;
    const data = await getRecords(s.eventType);
    setRecords(data);
  }, []);

  useEffect(() => {
    async function init() {
      const s = await getSettings();
      setSettings(s);
      const data = await getRecords(s.eventType);
      setRecords(data);
      setLoading(false);
    }
    init();
  }, []);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const next = { ...settingsRef.current, ...partial };
      setSettings(next);
      await saveSettings(next);
      if (partial.eventType !== undefined) {
        const data = await getRecords(next.eventType);
        setRecords(data);
      }
    },
    []
  );

  const recordEntry = useCallback(
    async (bibOverride?: string | null): Promise<TimingRecord | null> => {
      const s = settingsRef.current;
      const currentRecords = recordsRef.current;

      let bib: string | null;
      if (bibOverride !== undefined) {
        bib = bibOverride;
      } else if (s.congestionMode) {
        bib = bibInput.trim() || null;
      } else {
        bib = bibInput.trim() || null;
        if (!bib && !s.congestionMode) return null;
      }

      const record = createRecord(s, currentRecords, bib);
      await addRecord(record);

      const updated = [...currentRecords, record].sort((a, b) => a.rank - b.rank);
      setRecords(updated);
      setBibInput("");
      speakRecord(record.bibNumber, record.rank, s.voiceEnabled);

      return record;
    },
    [bibInput]
  );

  const editRecord = useCallback(async (record: TimingRecord) => {
    await updateRecord(record);
    setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
  }, []);

  const removeRecord = useCallback(
    async (id: string) => {
      await deleteRecord(id);
      const remaining = recordsRef.current.filter((r) => r.id !== id);
      const reordered = reorderRanks(remaining);
      await saveAllRecords(reordered);
      setRecords(reordered);
    },
    []
  );

  const reorderRecords = useCallback(async (newRecords: TimingRecord[]) => {
    const reordered = reorderRanks(newRecords);
    await saveAllRecords(reordered);
    setRecords(reordered);
  }, []);

  const refreshAll = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    const data = await getRecords(s.eventType);
    setRecords(data);
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        records,
        loading,
        bibInput,
        setBibInput,
        updateSettings,
        recordEntry,
        editRecord,
        removeRecord,
        reorderRecords,
        refreshRecords,
        refreshAll,
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
