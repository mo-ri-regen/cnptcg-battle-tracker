import { NextRequest, NextResponse } from 'next/server';
import { BattleService } from '@/lib/services/battleService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid battle record ID' },
        { status: 400 }
      );
    }

    const battle = BattleService.getBattleRecordById(id);
    if (!battle) {
      return NextResponse.json(
        { error: 'Battle record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(battle);
  } catch (error) {
    console.error('Error fetching battle record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid battle record ID' },
        { status: 400 }
      );
    }

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

    const updatedBattle = BattleService.updateBattleRecord(
      id,
      battleDate,
      myDeckId,
      opponentDeckName.trim(),
      result,
      firstAttack,
      opponentColorIds,
      eventName?.trim(),
      notes?.trim()
    );

    return NextResponse.json(updatedBattle);
  } catch (error) {
    console.error('Error updating battle record:', error);
    if (error instanceof Error && error.message === 'Battle record not found') {
      return NextResponse.json(
        { error: 'Battle record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update battle record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid battle record ID' },
        { status: 400 }
      );
    }

    const success = BattleService.deleteBattleRecord(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Battle record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Battle record deleted successfully' });
  } catch (error) {
    console.error('Error deleting battle record:', error);
    return NextResponse.json(
      { error: 'Failed to delete battle record' },
      { status: 500 }
    );
  }
}