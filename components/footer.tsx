'use client';

import Link from 'next/link';
import {
  Glasses, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram,
  Twitter, Clock, ArrowRight, Send, Code2, Heart, Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { toast } from 'sonner';
import { useState } from 'react';

const QUICK_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Eye Services' },
  { href: '/products', label: 'Shop Eyewear' },
  { href: '/lenses', label: 'Prescription Lenses' },
  { href: '/book', label: 'Book Eye Test' },
  { href: '/offers', label: 'Offers & Discounts' },
  { href: '/blog', label: 'Eye Care Blog' },
];

const SOCIALS = [
  { Icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white' },
  { Icon: Instagram, label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent' },
  { Icon: Twitter, label: 'Twitter', color: 'hover:bg-black hover:text-white hover:border-black' },
];

export function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setEmail('');
    toast.success('Thanks for subscribing! We\'ll send you exclusive offers.');
  };

  return (
    <footer className="relative mt-24 border-t border-border/60 bg-card/50">
      <div className="bg-mesh">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand + social */}
            <div className="lg:col-span-4">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow overflow-hidden transition group-hover:scale-105">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt={settings.site_name} className="h-full w-full object-cover" />
                  ) : (
                    <Glasses className="h-5 w-5" />
                  )}
                </div>
                <span className="font-display text-lg font-bold tracking-tight">
                  {settings.site_name}
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Premium eye care and designer eyewear. Serving our community with
                expert vision services since 2010.
              </p>
              <div className="mt-6 flex gap-3">
                {SOCIALS.map(({ Icon, label, color }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`grid h-10 w-10 place-items-center rounded-full border border-border bg-background/60 text-muted-foreground transition duration-200 ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group inline-flex items-center gap-1 text-muted-foreground transition hover:text-primary">
                      <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Get in Touch
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{settings.contact_address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="transition hover:text-primary">{settings.contact_phone}</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${settings.contact_email}`} className="transition hover:text-primary">{settings.contact_email}</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  <span>{settings.business_hours}</span>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success hover:text-success-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Get Exclusive Offers
              </h4>
              <p className="mt-4 text-sm text-muted-foreground">
                Join our newsletter for eye care tips and special discounts.
              </p>
              <form className="mt-4 space-y-2" onSubmit={subscribe}>
                <div className="flex gap-2">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="h-10" />
                  <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">No spam, unsubscribe anytime.</p>
              </form>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-border/60 pt-8">
            {/* Developer credit */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/40 bg-gradient-to-r from-card/40 via-muted/20 to-card/40 p-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-border/60 bg-gradient-to-br from-primary/20 to-accent/20">
                  {settings.developer_photo ? (
                    <img src={settings.developer_photo} alt={settings.developer_name} className="h-full w-full object-cover" />
                  ) : (
                    <Code2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="text-sm">
                  <p className="flex items-center gap-1.5 font-medium">
                    <span>Crafted by {settings.developer_name}</span>
                    <Heart className="h-3 w-3 fill-destructive text-destructive" />
                  </p>
                  <p className="text-xs text-muted-foreground">{settings.developer_title}</p>
                </div>
              </div>
              {settings.developer_whatsapp && (
                <a
                  href={`https://wa.me/${settings.developer_whatsapp}?text=Hi%20${encodeURIComponent(settings.developer_name)},%20I%20saw%20your%20work%20on%20${encodeURIComponent(settings.site_name)}%20and%20I'd%20like%20a%20website%20for%20my%20business.`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] hover:shadow-xl"
                >
                  <Sparkles className="h-4 w-4" />
                  Need a website? Let's talk
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
              )}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
              <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/contact" className="transition hover:text-primary">Privacy</Link>
                <Link href="/contact" className="transition hover:text-primary">Terms</Link>
                <Link href="/login" className="transition hover:text-primary">Staff Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
