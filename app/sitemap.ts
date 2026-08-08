import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://amiroptical.example.com';
  const staticRoutes = ['', '/about', '/services', '/products', '/book', '/contact', '/blog', '/offers', '/login', '/signup'].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from('products').select('slug, created_at'),
    supabase.from('blog_posts').select('slug, published_at'),
  ]);

  const productRoutes = (products ?? []).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.created_at as string),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const blogRoutes = (posts ?? []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.published_at as string),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
