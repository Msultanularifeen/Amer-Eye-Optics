import { AdminShell } from '@/components/admin-shell';
import { AdminBlog } from '@/components/admin-blog';

export const metadata = { title: 'Blog' };

export default function AdminBlogPage() {
  return <AdminShell><AdminBlog /></AdminShell>;
}
