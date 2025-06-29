import { NextResponse } from 'next/server';
import { BattleService } from '@/lib/services/battleService';

export async function GET() {
  try {
    const statistics = BattleService.getStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}