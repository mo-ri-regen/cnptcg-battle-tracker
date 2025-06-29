import { NextRequest, NextResponse } from 'next/server';
import { BattleService } from '@/lib/services/battleService';

export async function GET() {
  try {
    const battles = BattleService.getAllBattleRecords();
    return NextResponse.json(battles);
  } catch (error) {
    console.error('Error fetching battle records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      battleDate,
      myDeckId,
      opponentDeckName,
      result,
      firstAttack,
      opponentColorIds,
      eventName,
      notes
    } = await request.json();

    // バリデーション
    if (!battleDate) {
      return NextResponse.json(
        { error: 'Battle date is required' },
        { status: 400 }
      );
    }

    if (!myDeckId || typeof myDeckId !== 'number') {
      return NextResponse.json(
        { error: 'My deck ID is required' },
        { status: 400 }
      );
    }

    if (!opponentDeckName || typeof opponentDeckName !== 'string' || opponentDeckName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Opponent deck name is required' },
        { status: 400 }
      );
    }

    if (!result || !['win', 'lose', 'draw'].includes(result)) {
      return NextResponse.json(
        { error: 'Valid result is required (win, lose, draw)' },
        { status: 400 }
      );
    }

    if (typeof firstAttack !== 'boolean') {
      return NextResponse.json(
        { error: 'First attack flag is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(opponentColorIds) || opponentColorIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one opponent color is required' },
        { status: 400 }
      );
    }

    const newBattle = BattleService.createBattleRecord(
      battleDate,
      myDeckId,
      opponentDeckName.trim(),
      result,
      firstAttack,
      opponentColorIds,
      eventName?.trim(),
      notes?.trim()
    );

    return NextResponse.json(newBattle, { status: 201 });
  } catch (error) {
    console.error('Error creating battle record:', error);
    return NextResponse.json(
      { error: 'Failed to create battle record' },
      { status: 500 }
    );
  }
}