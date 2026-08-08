import { AdminShell } from '@/components/admin-shell';
import { AdminOffers } from '@/components/admin-offers';

export const metadata = { title: 'Offers' };

export default function AdminOffersPage() {
  return <AdminShell><AdminOffers /></AdminShell>;
}
