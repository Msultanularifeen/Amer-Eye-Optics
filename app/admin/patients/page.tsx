import { AdminShell } from '@/components/admin-shell';
import { AdminPatients } from '@/components/admin-patients';

export const metadata = { title: 'Patients' };

export default function AdminPatientsPage() {
  return <AdminShell><AdminPatients /></AdminShell>;
}
