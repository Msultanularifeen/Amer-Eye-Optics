import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';

export const metadata: Metadata = { title: 'My Dashboard' };

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
