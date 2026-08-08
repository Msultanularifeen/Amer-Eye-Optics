import { AdminShell } from '@/components/admin-shell';
import { AdminOverview } from '@/components/admin-overview';

export const metadata = { title: 'Admin Overview' };

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminOverview />
    </AdminShell>
  );
}
