'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Note {
  id: number;
  note: string;
  created_by: string | null;
  created_at: string;
}

interface OrderNotesProps {
  orderId: string;
  notes: Note[];
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OrderNotes({ orderId, notes }: OrderNotesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAdding(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to add note');
      }

      setNewNote('');
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EAD6D6]">
      <h2 className="font-semibold text-[#541409] mb-4">Internal Notes</h2>

      {/* Add note form */}
      <div className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-[#EAD6D6] rounded-lg focus:ring-2 focus:ring-[#541409] focus:border-[#541409] outline-none resize-none text-[#541409]"
        />
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
        <button
          onClick={handleAddNote}
          disabled={isAdding || isPending || !newNote.trim()}
          className="mt-2 px-4 py-2 text-sm bg-[#541409] text-[#EAD6D6] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isAdding ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-[#541409]/60 text-center py-4">
          No notes yet.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-[#EAD6D6]/20 rounded-lg"
            >
              <p className="text-sm text-[#541409] whitespace-pre-wrap">
                {note.note}
              </p>
              <p className="text-xs text-[#541409]/60 mt-2">
                {formatDateTime(note.created_at)}
                {note.created_by && ` by ${note.created_by}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
