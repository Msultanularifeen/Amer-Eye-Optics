import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle, Clock, Navigation, AlertCircle } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { ContactForm } from '@/components/contact-form';
import { Card } from '@/components/ui/card';
import { getSiteSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Amir Optical Center. Find our location, hours, phone, WhatsApp, and email — or send us a message.',
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const contactCards = [
    { icon: MapPin, title: 'Visit Us', lines: settings.contact_address.split(', '), color: 'text-primary' },
    { icon: Phone, title: 'Call Us', lines: [settings.contact_phone, settings.contact_phone_alt].filter(Boolean), color: 'text-accent', href: `tel:${settings.contact_phone.replace(/\s/g, '')}` },
    { icon: Mail, title: 'Email Us', lines: [settings.contact_email, settings.contact_email_alt].filter(Boolean), color: 'text-primary', href: `mailto:${settings.contact_email}` },
    { icon: MessageCircle, title: 'WhatsApp', lines: ['Chat with us instantly', settings.business_hours], color: 'text-success', href: `https://wa.me/${settings.whatsapp_number}` },
  ];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Contact"
              title="We'd love to hear from you"
              subtitle="Have a question, need directions, or want to book over the phone? Reach out — we're here to help."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {contactCards.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <Card className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted ${c.color}`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{c.title}</h3>
                      {c.lines.map((l) => (
                        <p key={l} className="text-sm text-muted-foreground">
                          {c.href ? (
                            <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-primary">{l}</a>
                          ) : l}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}

            <Reveal delay={0.32}>
              <Card className="border-warning/30 bg-warning/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <h3 className="font-medium text-sm">Emergency Contact</h3>
                    <p className="text-xs text-muted-foreground mt-1">For eye emergencies after hours, call <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="font-medium text-foreground">{settings.contact_phone}</a></p>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>

          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <Card className="p-6 md:p-8">
                <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">We typically respond within a few hours during business hours.</p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Find Us" title="Location & hours" />
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <Reveal delay={0.1} className="lg:col-span-2">
              <Card className="overflow-hidden p-0">
                <div className="relative aspect-[16/10] w-full">
                  <iframe
                    title="Amir Optical Center location"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.contact_map_lng - 0.01}%2C${settings.contact_map_lat - 0.005}%2C${settings.contact_map_lng + 0.01}%2C${settings.contact_map_lat + 0.005}&layer=mapnik&marker=${settings.contact_map_lat}%2C${settings.contact_map_lng}`}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{settings.contact_address}</p>
                      <p className="text-sm text-muted-foreground">Easy parking available on-site</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${settings.contact_map_lat},${settings.contact_map_lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent"
                    >
                      <Navigation className="h-4 w-4" /> Directions
                    </a>
                  </div>
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.2}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display font-semibold">Business Hours</h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">{settings.business_hours}</p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
