import { NextRequest, NextResponse } from 'next/server';
import { DeckService } from '@/lib/services/deckService';

export async function GET() {
  try {
    const decks = DeckService.getAllMyDecks();
    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, colorId, notes } = await request.json();

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    if (!colorId || typeof colorId !== 'number') {
      return NextResponse.json(
        { error: 'Color ID is required' },
        { status: 400 }
      );
    }

    // デッキ名の重複チェック
    if (DeckService.isDeckNameExists(name.trim())) {
      return NextResponse.json(
        { error: 'Deck name already exists' },
        { status: 400 }
      );
    }

    const newDeck = DeckService.createDeck(name.trim(), colorId, notes?.trim());
    return NextResponse.json(newDeck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}