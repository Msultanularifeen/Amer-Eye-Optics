import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Eye, Heart, Award, ShieldCheck, Sparkles, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { AnimatedCounter } from '@/components/animated-counter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSiteSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Amir Optical Center — our history, mission, vision, and the expert team behind 15 years of trusted eye care.',
};

const GALLERY = [
  'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/262466/pexels-photo-262466.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3781368/pexels-photo-3781368.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="About Us"
              title="Caring for your vision since 2010"
              subtitle="What began as a small neighborhood optical shop has grown into one of the region's most trusted eye care centers — built on expertise, honesty, and genuine care."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-premium">
              <Image
                src={settings.about_image}
                alt="Amir Optical Center"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Our Story</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Amir Optical Center was founded in 2010 with a simple belief: everyone
                deserves to see the world clearly. Starting with a single exam room
                and a handful of frames, we earned our community&apos;s trust through
                honest advice and careful, thorough eye exams.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Today, our modern clinic features advanced diagnostic equipment, a
                curated collection of over 500 frames, and a team of certified
                optometrists — but our commitment to personal, genuine care has
                never changed.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[`${settings.stat_years}+ Years`, `${Number(settings.stat_customers).toLocaleString()}+ Patients`, `${settings.stat_frames}+ Frames`, '3 Specialists'].map((t) => (
                  <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Our Values" title="What drives us every day" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: 'Our Mission', body: settings.about_mission },
              { icon: Eye, title: 'Our Vision', body: settings.about_vision },
              { icon: Heart, title: 'Our Promise', body: 'Honest advice, no unnecessary upsells, and thorough care — because your trust is worth more than any sale.' },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <Card className="h-full p-8 text-center">
                  <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Certifications" title="Trusted & certified" subtitle="Our team and clinic hold the credentials that matter for your eye health." />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, title: 'FCPS Ophthalmology', sub: 'College of Physicians' },
            { icon: ShieldCheck, title: 'ISO Certified Clinic', sub: 'Quality management' },
            { icon: Sparkles, title: 'Advanced Diagnostics', sub: 'Modern equipment' },
            { icon: Users, title: 'Licensed Optometrists', sub: 'Registered practitioners' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Card className="flex items-center gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Gallery" title="Take a tour of our clinic" subtitle="A clean, modern, welcoming space designed for your comfort." />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {GALLERY.map((src, i) => (
              <Reveal key={src} delay={i * 0.05}>
                <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60">
                  <Image
                    src={src}
                    alt={`Clinic photo ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Users, value: settings.stat_customers, suffix: '+', label: 'Patients Served' },
            { icon: Award, value: settings.stat_years, suffix: '', label: 'Years Experience' },
            { icon: CheckCircle2, value: settings.stat_happy, suffix: '%', label: 'Satisfaction' },
            { icon: Sparkles, value: 12, suffix: '', label: 'Services Offered' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-3xl font-semibold sm:text-4xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/book"><Calendar className="mr-2 h-5 w-5" /> Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
