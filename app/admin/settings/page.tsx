import { AdminShell } from '@/components/admin-shell';
import { AdminSettings } from '@/components/admin-settings';

export const metadata = { title: 'Site Settings' };

export default function AdminSettingsPage() {
  return <AdminShell><AdminSettings /></AdminShell>;
}
