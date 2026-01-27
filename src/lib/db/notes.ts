import { getDB } from './index';

export interface OrderNote {
  id: number;
  order_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
}

// Get all notes for an order
export async function getOrderNotes(orderId: string): Promise<OrderNote[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM order_notes WHERE order_id = ? ORDER BY created_at DESC')
    .bind(orderId)
    .all<OrderNote>();
  return result.results || [];
}

// Add a note to an order
export async function addOrderNote(
  orderId: string,
  note: string,
  createdBy?: string
): Promise<number> {
  const db = getDB();
  const result = await db
    .prepare('INSERT INTO order_notes (order_id, note, created_by) VALUES (?, ?, ?)')
    .bind(orderId, note, createdBy ?? null)
    .run();
  return result.meta?.last_row_id ?? 0;
}

// Delete a note
export async function deleteOrderNote(noteId: number): Promise<void> {
  const db = getDB();
  await db
    .prepare('DELETE FROM order_notes WHERE id = ?')
    .bind(noteId)
    .run();
}

// Update a note
export async function updateOrderNote(noteId: number, note: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('UPDATE order_notes SET note = ? WHERE id = ?')
    .bind(note, noteId)
    .run();
}
