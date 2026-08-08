import { AdminShell } from '@/components/admin-shell';
import { AdminOrders } from '@/components/admin-orders';

export const metadata = { title: 'Orders' };

export default function AdminOrdersPage() {
  return <AdminShell><AdminOrders /></AdminShell>;
}
