'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';

interface DeckColor {
  id: number;
  name: string;
  display_name: string;
  color_code: string;
}

interface MyDeck {
  id: number;
  name: string;
  color_id: number;
  notes?: string;
  created_at: string;
  color?: DeckColor;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<MyDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`デッキ「${name}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDecks(decks.filter(deck => deck.id !== id));
      } else {
        alert('デッキの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('デッキの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            デッキ管理
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            登録されているデッキの一覧と管理
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/decks/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            新しいデッキを追加
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {decks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <div className="flex-shrink-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: deck.color?.color_code }}
                    >
                      {deck.color?.display_name?.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{deck.name}</p>
                      <p className="text-sm text-gray-500">{deck.color?.display_name}</p>
                      {deck.notes && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{deck.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        作成日: {new Date(deck.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    <Link
                      href={`/decks/${deck.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(deck.id, deck.name);
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <ViewColumnsIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">デッキがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                最初のデッキを作成して対戦記録を始めましょう。
              </p>
              <div className="mt-6">
                <Link
                  href="/decks/new"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                  新しいデッキを追加
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}