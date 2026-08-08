import type { Metadata } from 'next';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { ProductCatalog } from '@/components/product-catalog';
import { getProducts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Shop Eyewear',
  description: 'Browse our collection of premium glasses, sunglasses, contact lenses, and accessories. Filter by brand, gender, price, and more.',
};

export default async function ProductsPage() {
  const products = await getProducts(50);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Shop"
              title="Find your perfect pair"
              subtitle="Explore our curated collection of designer frames, sunglasses, contact lenses, and accessories."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductCatalog initial={products} />
      </section>
    </SiteLayout>
  );
}
