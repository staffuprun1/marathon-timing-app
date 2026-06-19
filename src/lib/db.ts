import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AppSettings, PhotoRecord, TimingRecord } from "./types";
import { DEFAULT_SETTINGS } from "./types";

interface MarathonDB extends DBSchema {
  records: {
    key: string;
    value: TimingRecord;
    indexes: { "by-event": EventTypeIndex; "by-rank": number };
  };
  photos: {
    key: string;
    value: PhotoRecord;
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
}

type EventTypeIndex = string;

const DB_NAME = "marathon-timing";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MarathonDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarathonDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const recordStore = db.createObjectStore("records", { keyPath: "id" });
        recordStore.createIndex("by-event", "eventType");
        recordStore.createIndex("by-rank", "rank");
        db.createObjectStore("photos", { keyPath: "id" });
        db.createObjectStore("settings", { keyPath: "id" });
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

export async function getRecords(eventType: string): Promise<TimingRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("records", "by-event", eventType);
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

export async function saveAllRecords(records: TimingRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("records", "readwrite");
  for (const record of records) {
    await tx.store.put(record);
  }
  await tx.done;
}

export async function addPhoto(photo: PhotoRecord): Promise<void> {
  const db = await getDB();
  await db.add("photos", photo);
}

export async function getPhoto(id: string): Promise<PhotoRecord | undefined> {
  const db = await getDB();
  return db.get("photos", id);
}

export async function getAllPhotos(): Promise<PhotoRecord[]> {
  const db = await getDB();
  return db.getAll("photos");
}

export async function exportAllData(): Promise<{
  settings: AppSettings;
  records: TimingRecord[];
  photos: PhotoRecord[];
}> {
  const db = await getDB();
  const [settings, records, photos] = await Promise.all([
    getSettings(),
    db.getAll("records"),
    db.getAll("photos"),
  ]);
  return { settings, records, photos };
}

export async function importAllData(data: {
  settings?: AppSettings;
  records?: TimingRecord[];
  photos?: PhotoRecord[];
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
  if (data.photos) {
    const tx = db.transaction("photos", "readwrite");
    await tx.store.clear();
    for (const photo of data.photos) {
      await tx.store.put(photo);
    }
    await tx.done;
  }
}

export async function clearEventRecords(eventType: string): Promise<void> {
  const db = await getDB();
  const records = await getRecords(eventType);
  const tx = db.transaction("records", "readwrite");
  for (const record of records) {
    await tx.store.delete(record.id);
  }
  await tx.done;
}
