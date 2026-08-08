import { supabase, type Product, type Doctor, type Service, type Testimonial, type Offer, type BlogPost, type LensType } from '@/lib/supabase';

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .or('is_featured.eq.true')
    .order('rating', { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getProducts(limit = 12): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getDoctors(): Promise<Doctor[]> {
  const { data } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
  return (data ?? []) as Doctor[];
}

export async function getDoctorsForService(serviceId: string): Promise<Doctor[]> {
  const { data } = await supabase
    .from('doctor_services')
    .select('doctor:doctors(*)')
    .eq('service_id', serviceId);
  return ((data ?? []) as unknown as { doctor: Doctor }[]).map((r) => r.doctor);
}

export async function getServices(): Promise<Service[]> {
  const { data } = await supabase.from('services').select('*').order('price', { ascending: true });
  return (data ?? []) as Service[];
}

export async function getTestimonials(limit = 6): Promise<Testimonial[]> {
  const { data } = await supabase.from('testimonials').select('*').limit(limit);
  return (data ?? []) as Testimonial[];
}

export async function getActiveOffers(): Promise<Offer[]> {
  const { data } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('valid_until', { ascending: true });
  return (data ?? []) as Offer[];
}

export async function getBlogPosts(limit = 6): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as BlogPost) ?? null;
}

export async function getLensTypes(): Promise<LensType[]> {
  const { data } = await supabase
    .from('lens_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as LensType[];
}
