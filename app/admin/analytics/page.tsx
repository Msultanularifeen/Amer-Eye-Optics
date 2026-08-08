import { AdminShell } from '@/components/admin-shell';
import { AdminAnalytics } from '@/components/admin-analytics';

export const metadata = { title: 'Analytics' };

export default function AdminAnalyticsPage() {
  return <AdminShell><AdminAnalytics /></AdminShell>;
}
