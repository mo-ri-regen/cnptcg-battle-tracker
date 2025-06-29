import db, { BattleRecord, DeckColor } from '../database';

export class BattleService {
  // 対戦記録を全て取得
  static getAllBattleRecords(): BattleRecord[] {
    const stmt = db.prepare(`
      SELECT 
        br.*,
        md.name as my_deck_name,
        dc.display_name as my_deck_color_display_name,
        dc.color_code as my_deck_color_code
      FROM battle_records br
      LEFT JOIN my_decks md ON br.my_deck_id = md.id
      LEFT JOIN deck_colors dc ON md.color_id = dc.id
      ORDER BY br.battle_date DESC, br.created_at DESC
    `);
    
    const rows = stmt.all() as any[];
    
    // 各記録に相手デッキの色情報を追加
    return rows.map(row => {
      const opponentColors = this.getOpponentColors(row.id);
      
      return {
        id: row.id,
        battle_date: row.battle_date,
        my_deck_id: row.my_deck_id,
        opponent_deck_name: row.opponent_deck_name,
        result: row.result as 'win' | 'lose' | 'draw',
        first_attack: row.first_attack,
        event_name: row.event_name,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        my_deck: {
          id: row.my_deck_id,
          name: row.my_deck_name,
          color: {
            display_name: row.my_deck_color_display_name,
            color_code: row.my_deck_color_code
          }
        },
        opponent_colors: opponentColors
      } as BattleRecord;
    });
  }

  // 対戦記録をIDで取得
  static getBattleRecordById(id: number): BattleRecord | null {
    const stmt = db.prepare(`
      SELECT 
        br.*,
        md.name as my_deck_name,
        dc.display_name as my_deck_color_display_name,
        dc.color_code as my_deck_color_code
      FROM battle_records br
      LEFT JOIN my_decks md ON br.my_deck_id = md.id
      LEFT JOIN deck_colors dc ON md.color_id = dc.id
      WHERE br.id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;

    const opponentColors = this.getOpponentColors(row.id);
    
    return {
      id: row.id,
      battle_date: row.battle_date,
      my_deck_id: row.my_deck_id,
      opponent_deck_name: row.opponent_deck_name,
      result: row.result as 'win' | 'lose' | 'draw',
      first_attack: row.first_attack,
      event_name: row.event_name,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      my_deck: {
        id: row.my_deck_id,
        name: row.my_deck_name,
        color: {
          display_name: row.my_deck_color_display_name,
          color_code: row.my_deck_color_code
        }
      },
      opponent_colors: opponentColors
    } as BattleRecord;
  }

  // 相手デッキの色情報を取得
  private static getOpponentColors(battleRecordId: number): DeckColor[] {
    const stmt = db.prepare(`
      SELECT dc.*
      FROM opponent_deck_colors odc
      LEFT JOIN deck_colors dc ON odc.color_id = dc.id
      WHERE odc.battle_record_id = ?
      ORDER BY dc.id
    `);
    
    return stmt.all(battleRecordId) as DeckColor[];
  }

  // 新しい対戦記録を作成
  static createBattleRecord(
    battleDate: string,
    myDeckId: number,
    opponentDeckName: string,
    result: 'win' | 'lose' | 'draw',
    firstAttack: boolean,
    opponentColorIds: number[],
    eventName?: string,
    notes?: string
  ): BattleRecord {
    const insertRecord = db.prepare(`
      INSERT INTO battle_records (
        battle_date, my_deck_id, opponent_deck_name, result, 
        first_attack, event_name, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertOpponentColor = db.prepare(`
      INSERT INTO opponent_deck_colors (battle_record_id, color_id)
      VALUES (?, ?)
    `);
    
    // トランザクション開始
    const transaction = db.transaction(() => {
      const result = insertRecord.run(
        battleDate, myDeckId, opponentDeckName, result, 
        firstAttack, eventName || null, notes || null
      );
      
      const battleRecordId = result.lastInsertRowid as number;
      
      // 相手デッキの色情報を挿入
      opponentColorIds.forEach(colorId => {
        insertOpponentColor.run(battleRecordId, colorId);
      });
      
      return battleRecordId;
    });
    
    const battleRecordId = transaction();
    const createdRecord = this.getBattleRecordById(battleRecordId);
    
    if (!createdRecord) {
      throw new Error('Failed to create battle record');
    }
    
    return createdRecord;
  }

  // 対戦記録を更新
  static updateBattleRecord(
    id: number,
    battleDate: string,
    myDeckId: number,
    opponentDeckName: string,
    result: 'win' | 'lose' | 'draw',
    firstAttack: boolean,
    opponentColorIds: number[],
    eventName?: string,
    notes?: string
  ): BattleRecord {
    const updateRecord = db.prepare(`
      UPDATE battle_records 
      SET battle_date = ?, my_deck_id = ?, opponent_deck_name = ?, 
          result = ?, first_attack = ?, event_name = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const deleteOpponentColors = db.prepare(`
      DELETE FROM opponent_deck_colors WHERE battle_record_id = ?
    `);
    
    const insertOpponentColor = db.prepare(`
      INSERT INTO opponent_deck_colors (battle_record_id, color_id)
      VALUES (?, ?)
    `);
    
    // トランザクション開始
    const transaction = db.transaction(() => {
      const result = updateRecord.run(
        battleDate, myDeckId, opponentDeckName, result,
        firstAttack, eventName || null, notes || null, id
      );
      
      if (result.changes === 0) {
        throw new Error('Battle record not found');
      }
      
      // 既存の相手デッキ色情報を削除
      deleteOpponentColors.run(id);
      
      // 新しい相手デッキ色情報を挿入
      opponentColorIds.forEach(colorId => {
        insertOpponentColor.run(id, colorId);
      });
    });
    
    transaction();
    const updatedRecord = this.getBattleRecordById(id);
    
    if (!updatedRecord) {
      throw new Error('Failed to update battle record');
    }
    
    return updatedRecord;
  }

  // 対戦記録を削除
  static deleteBattleRecord(id: number): boolean {
    const stmt = db.prepare('DELETE FROM battle_records WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 統計情報を取得
  static getStatistics() {
    // 総合勝率
    const overallStats = db.prepare(`
      SELECT 
        result,
        COUNT(*) as count
      FROM battle_records
      GROUP BY result
    `).all() as { result: string; count: number }[];

    // デッキ別勝率
    const deckStats = db.prepare(`
      SELECT 
        md.name as deck_name,
        dc.display_name as deck_color,
        dc.color_code as deck_color_code,
        br.result,
        COUNT(*) as count
      FROM battle_records br
      LEFT JOIN my_decks md ON br.my_deck_id = md.id
      LEFT JOIN deck_colors dc ON md.color_id = dc.id
      GROUP BY md.id, br.result
      ORDER BY md.name, br.result
    `).all() as any[];

    // 先攻/後攻別勝率
    const firstAttackStats = db.prepare(`
      SELECT 
        first_attack,
        result,
        COUNT(*) as count
      FROM battle_records
      GROUP BY first_attack, result
    `).all() as { first_attack: number; result: string; count: number }[];

    return {
      overall: overallStats,
      byDeck: deckStats,
      byFirstAttack: firstAttackStats
    };
  }
}