import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar, Eye, Glasses, MonitorSmartphone, Baby, Telescope, Search, Aperture,
  Palette, Gauge, Activity, Cloud, Stethoscope, CheckCircle2, Clock,
} from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServices } from '@/lib/data';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Eye Care Services',
  description: 'Comprehensive eye care services at Amir Optical Center — eye exams, vision testing, children checkups, cataract consultation, and more.',
};

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye, Glasses, Monitor: MonitorSmartphone, Baby, Telescope, Search, Aperture, Palette, Gauge, Activity, Cloud, Stethoscope,
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Our Services"
              title="Complete eye care, all in one place"
              subtitle="From routine vision testing to specialized consultations, our certified team offers a full spectrum of eye care services using modern diagnostic technology."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon] ?? Eye;
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <Card className="group flex h-full flex-col p-6 transition hover:border-primary/40 hover:shadow-premium">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      <Clock className="mr-1 h-3 w-3" /> {s.duration_mins} min
                    </Badge>
                  </div>
                  <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <span className="font-display text-lg font-semibold text-primary">{formatPrice(Number(s.price))}</span>
                    </div>
                    <Button asChild size="sm" className="rounded-full">
                      <Link href="/book"><Calendar className="mr-1.5 h-4 w-4" /> Book</Link>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-card/40 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="How It Works" title="Your visit, simplified" subtitle="Booking and visiting us is easy. Here's what to expect." />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'Book Online', body: 'Choose your service, doctor, and a time that suits you — all in under two minutes.' },
              { step: '02', title: 'Get Examined', body: 'Arrive at your appointment for a thorough exam using our modern diagnostic equipment.' },
              { step: '03', title: 'Leave Seeing Clearly', body: 'Walk out with your prescription, frames, or treatment plan — and a follow-up if needed.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div className="relative rounded-2xl border border-border/60 bg-card p-6">
                  <span className="font-display text-4xl font-semibold text-primary/20">{s.step}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Why choose Amir Optical?</h2>
              <ul className="mt-6 space-y-3">
                {[
                  'Certified, experienced optometrists',
                  'Modern diagnostic equipment',
                  'Transparent, fair pricing',
                  'Same-day glasses for most prescriptions',
                  'Comfortable, modern clinic',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start justify-center gap-4 md:items-end">
              <p className="text-muted-foreground">Have questions or ready to book?</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/book"><Calendar className="mr-2 h-5 w-5" /> Book Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
