import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export interface FlashcardInterface {
  id: number;
  text: string;
  translation: string;
  success_count: number;
  fail_count: number;
  last_success_at: number | null;
  introduced_at: number;
}

export interface Stats {
  key: string;
  value: string;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync("flashcards_test.db");

  // Create flashcards table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      translation TEXT NOT NULL,
      success_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      last_success_at INTEGER,
      introduced_at INTEGER NOT NULL
    );
  `);

  // Create stats table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stats (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Initialize lifetime counter if it doesn't exist
  const counterResult = await db.getFirstAsync<Stats>(
    "SELECT * FROM stats WHERE key = ?",
    ["lifetime_count"]
  );

  if (!counterResult) {
    await db.runAsync("INSERT INTO stats (key, value) VALUES (?, ?)", [
      "lifetime_count",
      "0",
    ]);
  }

  // Add mock data if database is empty
  const flashcardCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM flashcards"
  );

  if (flashcardCount && flashcardCount.count === 0) {
    const mockData = [
      { text: "Hello", translation: "Bonjour", introduced_at: Date.now() },
      { text: "Thank you", translation: "Merci", introduced_at: Date.now() },
      { text: "Goodbye", translation: "Au revoir", introduced_at: Date.now() },
      {
        text: "Please",
        translation: "S'il vous plaît",
        introduced_at: Date.now(),
      },
      { text: "Yes", translation: "Oui", introduced_at: Date.now() },
    ];

    for (const card of mockData) {
      await db.runAsync(
        "INSERT INTO flashcards (text, translation, introduced_at) VALUES (?, ?, ?)",
        [card.text, card.translation, card.introduced_at]
      );
    }
  }

  return db;
}

export async function getAllFlashcards(): Promise<FlashcardInterface[]> {
  const database = await initDatabase();
  const result = await database.getAllAsync<FlashcardInterface>(
    "SELECT * FROM flashcards ORDER BY introduced_at DESC"
  );
  return result;
}

export async function addFlashcard(
  text: string,
  translation: string
): Promise<number> {
  const database = await initDatabase();
  const result = await database.runAsync(
    "INSERT INTO flashcards (text, translation, introduced_at) VALUES (?, ?, ?)",
    [text, translation, Date.now()]
  );
  return result.lastInsertRowId;
}

export async function updateFlashcardSuccess(id: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    "UPDATE flashcards SET success_count = success_count + 1, last_success_at = ? WHERE id = ?",
    [Date.now(), id]
  );
}

export async function updateFlashcardFail(id: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    "UPDATE flashcards SET fail_count = fail_count + 1 WHERE id = ?",
    [id]
  );
}

export async function getLifetimeCount(): Promise<number> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<Stats>(
    "SELECT * FROM stats WHERE key = ?",
    ["lifetime_count"]
  );
  return result ? parseInt(result.value, 10) : 0;
}

export async function incrementLifetimeCount(): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    "UPDATE stats SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT) WHERE key = ?",
    ["lifetime_count"]
  );
}
