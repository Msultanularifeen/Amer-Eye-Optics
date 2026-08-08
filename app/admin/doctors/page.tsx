import { AdminShell } from '@/components/admin-shell';
import { AdminDoctors } from '@/components/admin-doctors';

export const metadata = { title: 'Doctors' };

export default function AdminDoctorsPage() {
  return <AdminShell><AdminDoctors /></AdminShell>;
}
