import { NextRequest, NextResponse } from 'next/server';
import { DeckService } from '@/lib/services/deckService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid deck ID' },
        { status: 400 }
      );
    }

    const deck = DeckService.getDeckById(id);
    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
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
        { error: 'Invalid deck ID' },
        { status: 400 }
      );
    }

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

    // デッキ名の重複チェック（自分自身は除外）
    if (DeckService.isDeckNameExists(name.trim(), id)) {
      return NextResponse.json(
        { error: 'Deck name already exists' },
        { status: 400 }
      );
    }

    const updatedDeck = DeckService.updateDeck(id, name.trim(), colorId, notes?.trim());
    return NextResponse.json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    if (error instanceof Error && error.message === 'Deck not found or already deleted') {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update deck' },
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
        { error: 'Invalid deck ID' },
        { status: 400 }
      );
    }

    const success = DeckService.deleteDeck(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}