import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, ShoppingBag, ArrowRight, Eye, Glasses,
  Award, Users, Sparkles, ShieldCheck, Star, Quote, ChevronRight,
  MonitorSmartphone, Baby, Telescope, Search, Aperture, Palette, Gauge, Activity,
  Cloud, Stethoscope,
} from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Hero } from '@/components/hero';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { AnimatedCounter } from '@/components/animated-counter';
import { ProductCard } from '@/components/product-card';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getFeaturedProducts, getDoctors, getServices, getTestimonials, getActiveOffers,
  getLensTypes,
} from '@/lib/data';
import { getSiteSettings } from '@/lib/settings';
import { formatPrice } from '@/lib/format';

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye, Glasses, Monitor: MonitorSmartphone, Baby, Telescope, Search, Aperture, Palette, Gauge, Activity, Cloud, Stethoscope,
};

export default async function HomePage() {
  const [products, doctors, services, testimonials, offers, settings, lensTypes] = await Promise.all([
    getFeaturedProducts(8),
    getDoctors(),
    getServices(),
    getTestimonials(6),
    getActiveOffers(),
    getSiteSettings(),
    getLensTypes(),
  ]);

  return (
    <SiteLayout>
      {/* ============ HERO ============ */}
      <Hero settings={settings} />

      {/* ============ STATS ============ */}
      <section className="relative -mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur md:grid-cols-4 md:p-8">
            {[
              { icon: Users, value: settings.stat_customers, suffix: '+', label: 'Customers Served' },
              { icon: Award, value: settings.stat_years, suffix: '', label: 'Years of Experience' },
              { icon: Glasses, value: settings.stat_frames, suffix: '+', label: 'Frames Available' },
              { icon: Star, value: settings.stat_happy, suffix: '%', label: 'Happy Customers' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-premium">
              <Image
                src={settings.about_image}
                alt="Amir Optical Center clinic"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div>
              <SectionHeading
                eyebrow="About Us"
                title={settings.about_title}
                subtitle={settings.about_subtitle}
                center={false}
              />
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold">Our Mission</h3>
                  <p className="mt-2 text-muted-foreground">
                    {settings.about_mission}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Our Vision</h3>
                  <p className="mt-2 text-muted-foreground">
                    {settings.about_vision}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {[['Certified', ShieldCheck], ['Trusted', Award], ['Modern Tech', Sparkles]].map(([label, Icon]) => {
                    const I = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <Badge key={label as string} variant="secondary" className="rounded-full px-3 py-1.5">
                        <I className="mr-1.5 h-3.5 w-3.5 text-primary" /> {label as string}
                      </Badge>
                    );
                  })}
                </div>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/about">Learn more about us <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="relative bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Services"
              title="Comprehensive eye care services"
              subtitle="From routine checkups to specialized consultations, we offer a full range of eye care under one roof."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 9).map((s, i) => {
              const Icon = serviceIcons[s.icon] ?? Eye;
              return (
                <Reveal key={s.id} delay={i * 0.05}>
                  <Link href="/services">
                    <Card className="group h-full p-6 transition hover:border-primary/40 hover:shadow-premium">
                      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">{formatPrice(Number(s.price))}</span>
                        <span className="text-xs text-muted-foreground">{s.duration_mins} mins</span>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/services">View all services <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <SectionHeading
              eyebrow="Shop"
              title="Featured eyewear collection"
              subtitle="Handpicked frames and lenses from the brands you love."
              center={false}
            />
            <Button asChild variant="outline" className="rounded-full shrink-0">
              <Link href="/products">Browse all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ LENSES ============ */}
      {lensTypes.length > 0 && (
        <section className="relative bg-card/40 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <SectionHeading
                  eyebrow="Prescription Lenses"
                  title="Order your lenses online"
                  subtitle="Blue cut, anti-glare, photochromic and more. Pick a lens, enter your numbers, and we'll prepare it for you."
                  center={false}
                />
                <Button asChild variant="outline" className="rounded-full shrink-0">
                  <Link href="/lenses">Order Lenses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {lensTypes.slice(0, 4).map((lens, i) => (
                <Reveal key={lens.id} delay={i * 0.05}>
                  <Link href="/lenses">
                    <Card className="group h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-premium">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {lens.image ? (
                          <Image src={lens.image} alt={lens.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground"><Eye className="h-12 w-12" /></div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold">{lens.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lens.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-display text-lg font-semibold text-primary">{formatPrice(lens.price)}</span>
                          <Badge variant="secondary" className="text-[11px]">Order</Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ DOCTORS ============ */}
      <section className="relative bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Team"
              title="Meet the eye care experts"
              subtitle="Experienced, compassionate professionals dedicated to your vision health."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {doctors.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.1}>
                <Card className="group overflow-hidden p-0">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={d.photo}
                      alt={d.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <h3 className="font-display text-xl font-semibold">{d.name}</h3>
                      <p className="text-sm text-white/80">{d.specialization}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <StarRating rating={d.rating} size={14} />
                        <span className="text-xs text-white/70">{d.reviews_count} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">{d.qualification}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{d.experience_years} years experience</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.available_days.map((day) => (
                        <Badge key={day} variant="secondary" className="text-[11px]">{day}</Badge>
                      ))}
                    </div>
                    <Button asChild size="sm" className="mt-4 w-full">
                      <Link href="/book"><Calendar className="mr-1.5 h-4 w-4" /> Book Appointment</Link>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OFFERS ============ */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Special Offers"
              title="Save on your next pair"
              subtitle="Exclusive deals and seasonal discounts for our valued customers."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offers.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                  <Badge className="mb-4 bg-primary text-primary-foreground">
                    {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `${formatPrice(Number(o.discount_value))} OFF`}
                  </Badge>
                  <h3 className="font-display text-xl font-semibold">{o.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Use code</p>
                      <code className="rounded bg-secondary px-2 py-1 text-sm font-semibold">{o.code}</code>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href="/products">Shop now <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Testimonials"
              title="What our customers say"
              subtitle="Real stories from real people who trust us with their vision."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
                <Card className="h-full p-6">
                  <Quote className="h-8 w-8 text-primary/30" />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full">
                      {t.avatar ? (
                        <Image src={t.avatar} alt={t.name} fill sizes="44px" className="object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <div className="ml-auto">
                      <StarRating rating={t.rating} size={14} />
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-10 text-center md:p-16">
            <div className="absolute inset-0 bg-mesh opacity-60" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Ready for clearer vision?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Book your eye examination today and discover the perfect frames for your face and style.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/book"><Calendar className="mr-2 h-5 w-5" /> Book Appointment</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/products"><ShoppingBag className="mr-2 h-5 w-5" /> Shop Eyewear</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
