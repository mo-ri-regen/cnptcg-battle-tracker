import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'tcg-battle.db');
const db = new Database(dbPath);

// デッキ色マスターテーブル
const createDeckColorsTable = `
  CREATE TABLE IF NOT EXISTS deck_colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    color_code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// 自分のデッキテーブル
const createMyDecksTable = `
  CREATE TABLE IF NOT EXISTS my_decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color_id INTEGER NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (color_id) REFERENCES deck_colors (id)
  )
`;

// 対戦記録テーブル
const createBattleRecordsTable = `
  CREATE TABLE IF NOT EXISTS battle_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    battle_date DATETIME NOT NULL,
    my_deck_id INTEGER NOT NULL,
    opponent_deck_name TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
    first_attack BOOLEAN NOT NULL,
    event_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (my_deck_id) REFERENCES my_decks (id)
  )
`;

// 相手デッキの色情報テーブル（多対多）
const createOpponentDeckColorsTable = `
  CREATE TABLE IF NOT EXISTS opponent_deck_colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    battle_record_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (battle_record_id) REFERENCES battle_records (id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES deck_colors (id),
    UNIQUE(battle_record_id, color_id)
  )
`;

// テーブル作成実行
db.exec(createDeckColorsTable);
db.exec(createMyDecksTable);
db.exec(createBattleRecordsTable);
db.exec(createOpponentDeckColorsTable);

// 初期デッキ色データの挿入
const insertInitialColors = db.prepare(`
  INSERT OR IGNORE INTO deck_colors (name, display_name, color_code) 
  VALUES (?, ?, ?)
`);

const initialColors = [
  ['red', '赤', '#ef4444'],
  ['blue', '青', '#3b82f6'],
  ['green', '緑', '#22c55e'],
  ['yellow', '黄', '#eab308'],
  ['purple', '紫', '#a855f7'],
];

initialColors.forEach(([name, displayName, colorCode]) => {
  insertInitialColors.run(name, displayName, colorCode);
});

export default db;

// 型定義
export interface DeckColor {
  id: number;
  name: string;
  display_name: string;
  color_code: string;
  created_at: string;
}

export interface MyDeck {
  id: number;
  name: string;
  color_id: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  color?: DeckColor;
}

export interface BattleRecord {
  id: number;
  battle_date: string;
  my_deck_id: number;
  opponent_deck_name: string;
  result: 'win' | 'lose' | 'draw';
  first_attack: boolean;
  event_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  my_deck?: MyDeck;
  opponent_colors?: DeckColor[];
}

export interface OpponentDeckColor {
  id: number;
  battle_record_id: number;
  color_id: number;
  created_at: string;
  color?: DeckColor;
}