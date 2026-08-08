import type { Metadata } from 'next';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { LensOrderForm } from '@/components/lens-order-form';
import { getLensTypes } from '@/lib/data';
import { getProducts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Prescription Lenses',
  description: 'Order prescription lenses online. Choose blue cut, anti-glare, photochromic, progressive and more. Enter your prescription and get lenses delivered.',
};

export default async function LensesPage() {
  const [lensTypes, frames] = await Promise.all([
    getLensTypes(),
    getProducts(24),
  ]);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Prescription Lenses"
              title="Order your lenses online"
              subtitle="Pick a lens type, enter your prescription numbers, and we'll prepare your lenses. Simple and easy."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <LensOrderForm lensTypes={lensTypes} frames={frames} />
      </section>
    </SiteLayout>
  );
}
