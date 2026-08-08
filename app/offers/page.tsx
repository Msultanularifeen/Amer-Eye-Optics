import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ShoppingBag, Copy, Check } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getActiveOffers } from '@/lib/data';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Offers & Discounts',
  description: 'Current promotions, seasonal discounts, and special offers at Amir Optical Center.',
};

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Offers"
              title="Special deals & discounts"
              subtitle="Save on eye exams, frames, and contact lenses with our latest promotions."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {offers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No active offers at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.1}>
                <Card className="relative overflow-hidden p-0">
                  <div className="relative bg-gradient-to-br from-primary/15 via-accent/5 to-transparent p-6">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                    <Badge className="mb-4 bg-primary text-primary-foreground">
                      {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `${formatPrice(Number(o.discount_value))} OFF`}
                    </Badge>
                    <h3 className="font-display text-xl font-semibold">{o.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                    <div className="mt-6 flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Use code</p>
                        <code className="text-lg font-bold tracking-wider text-primary">{o.code}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">Until {new Date(o.valid_until).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 p-4">
                    <Button asChild className="flex-1 rounded-full">
                      <Link href="/products"><ShoppingBag className="mr-2 h-4 w-4" /> Shop Now</Link>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={0.3}>
          <div className="mt-12 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 text-center md:p-12">
            <h2 className="font-display text-2xl font-semibold">Need an eye exam first?</h2>
            <p className="mt-2 text-muted-foreground">Book an appointment and our offers apply to your eyewear purchase too.</p>
            <Button asChild className="mt-6 rounded-full" size="lg">
              <Link href="/book"><Calendar className="mr-2 h-5 w-5" /> Book Appointment</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
