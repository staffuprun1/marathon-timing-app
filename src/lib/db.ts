import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AppSettings, TimingRecord } from "./types";
import { DEFAULT_SETTINGS } from "./types";

interface MarathonDB extends DBSchema {
  records: {
    key: string;
    value: TimingRecord;
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
}

const DB_NAME = "marathon-timing-v2";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MarathonDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarathonDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("records")) {
          db.createObjectStore("records", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

const SETTINGS_KEY = "app-settings";

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const stored = await db.get("settings", SETTINGS_KEY);
  if (!stored) return { ...DEFAULT_SETTINGS };
  const { id: _id, ...settings } = stored;
  return settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", { id: SETTINGS_KEY, ...settings });
}

export async function getAllRecords(): Promise<TimingRecord[]> {
  const db = await getDB();
  const all = await db.getAll("records");
  return all.sort((a, b) => a.rank - b.rank);
}

export async function addRecord(record: TimingRecord): Promise<void> {
  const db = await getDB();
  await db.add("records", record);
}

export async function updateRecord(record: TimingRecord): Promise<void> {
  const db = await getDB();
  await db.put("records", record);
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("records", id);
}

export async function deleteAllRecords(): Promise<void> {
  const db = await getDB();
  await db.clear("records");
}

export async function saveAllRecords(records: TimingRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("records", "readwrite");
  for (const record of records) {
    await tx.store.put(record);
  }
  await tx.done;
}

export async function exportAllData(): Promise<{
  settings: AppSettings;
  records: TimingRecord[];
}> {
  const db = await getDB();
  const [settings, records] = await Promise.all([
    getSettings(),
    db.getAll("records"),
  ]);
  return { settings, records };
}

export async function importAllData(data: {
  settings?: AppSettings;
  records?: TimingRecord[];
}): Promise<void> {
  const db = await getDB();
  if (data.settings) {
    await saveSettings(data.settings);
  }
  if (data.records) {
    const tx = db.transaction("records", "readwrite");
    await tx.store.clear();
    for (const record of data.records) {
      await tx.store.put(record);
    }
    await tx.done;
  }
}
