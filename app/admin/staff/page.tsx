import { AdminShell } from '@/components/admin-shell';
import { AdminStaff } from '@/components/admin-staff';

export const metadata = { title: 'Staff & Users' };

export default function AdminStaffPage() {
  return <AdminShell><AdminStaff /></AdminShell>;
}
