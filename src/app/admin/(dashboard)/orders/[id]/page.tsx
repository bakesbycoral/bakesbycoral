import { notFound } from 'next/navigation';
import { getDB } from '@/lib/db';
import { getOrderNotes } from '@/lib/db/notes';
import { OrderDetailView } from '@/components/admin/OrderDetailView';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  backup_date: string | null;
  backup_time: string | null;
  pickup_person_name: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  notes: string | null;
  form_data: string | null;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  created_at: string;
  updated_at: string | null;
  paid_at: string | null;
  deposit_paid_at: string | null;
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const db = getDB();

  const order = await db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).bind(id).first<Order>();

  if (!order) {
    notFound();
  }

  // Fetch notes for this order
  const notes = await getOrderNotes(order.id);

  return <OrderDetailView order={order} notes={notes} />;
}
