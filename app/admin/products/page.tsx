import { AdminShell } from '@/components/admin-shell';
import { AdminProducts } from '@/components/admin-products';

export const metadata = { title: 'Product Management' };

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <AdminProducts />
    </AdminShell>
  );
}
