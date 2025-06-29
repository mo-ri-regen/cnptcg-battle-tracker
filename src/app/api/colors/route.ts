import { NextResponse } from 'next/server';
import { DeckService } from '@/lib/services/deckService';

export async function GET() {
  try {
    const colors = DeckService.getAllColors();
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}