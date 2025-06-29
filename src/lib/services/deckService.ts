import db, { DeckColor, MyDeck } from '../database';

export class DeckService {
  // 全デッキ色を取得
  static getAllColors(): DeckColor[] {
    const stmt = db.prepare('SELECT * FROM deck_colors ORDER BY id');
    return stmt.all() as DeckColor[];
  }

  // 自分のデッキを全て取得
  static getAllMyDecks(): MyDeck[] {
    const stmt = db.prepare(`
      SELECT 
        md.*,
        dc.name as color_name,
        dc.display_name as color_display_name,
        dc.color_code as color_code
      FROM my_decks md
      LEFT JOIN deck_colors dc ON md.color_id = dc.id
      WHERE md.is_active = 1
      ORDER BY md.created_at DESC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      color_id: row.color_id,
      notes: row.notes,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      color: {
        id: row.color_id,
        name: row.color_name,
        display_name: row.color_display_name,
        color_code: row.color_code,
        created_at: ''
      }
    }));
  }

  // デッキをIDで取得
  static getDeckById(id: number): MyDeck | null {
    const stmt = db.prepare(`
      SELECT 
        md.*,
        dc.name as color_name,
        dc.display_name as color_display_name,
        dc.color_code as color_code
      FROM my_decks md
      LEFT JOIN deck_colors dc ON md.color_id = dc.id
      WHERE md.id = ? AND md.is_active = 1
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      color_id: row.color_id,
      notes: row.notes,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      color: {
        id: row.color_id,
        name: row.color_name,
        display_name: row.color_display_name,
        color_code: row.color_code,
        created_at: ''
      }
    };
  }

  // 新しいデッキを作成
  static createDeck(name: string, colorId: number, notes?: string): MyDeck {
    const stmt = db.prepare(`
      INSERT INTO my_decks (name, color_id, notes)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(name, colorId, notes || null);
    const createdDeck = this.getDeckById(result.lastInsertRowid as number);
    
    if (!createdDeck) {
      throw new Error('Failed to create deck');
    }
    
    return createdDeck;
  }

  // デッキを更新
  static updateDeck(id: number, name: string, colorId: number, notes?: string): MyDeck {
    const stmt = db.prepare(`
      UPDATE my_decks 
      SET name = ?, color_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `);
    
    const result = stmt.run(name, colorId, notes || null, id);
    
    if (result.changes === 0) {
      throw new Error('Deck not found or already deleted');
    }
    
    const updatedDeck = this.getDeckById(id);
    if (!updatedDeck) {
      throw new Error('Failed to update deck');
    }
    
    return updatedDeck;
  }

  // デッキを削除（論理削除）
  static deleteDeck(id: number): boolean {
    const stmt = db.prepare(`
      UPDATE my_decks 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // デッキ名の重複チェック
  static isDeckNameExists(name: string, excludeId?: number): boolean {
    let stmt;
    let result;
    
    if (excludeId) {
      stmt = db.prepare('SELECT COUNT(*) as count FROM my_decks WHERE name = ? AND id != ? AND is_active = 1');
      result = stmt.get(name, excludeId) as { count: number };
    } else {
      stmt = db.prepare('SELECT COUNT(*) as count FROM my_decks WHERE name = ? AND is_active = 1');
      result = stmt.get(name) as { count: number };
    }
    
    return result.count > 0;
  }
}