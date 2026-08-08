import { AdminShell } from '@/components/admin-shell';
import { AdminAppointments } from '@/components/admin-appointments';

export const metadata = { title: 'Appointments' };

export default function AdminAppointmentsPage() {
  return <AdminShell><AdminAppointments /></AdminShell>;
}
