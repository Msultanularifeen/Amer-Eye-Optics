'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Calendar, ShoppingBag, Phone, MessageCircle, Glasses, CheckCircle2, Sparkles, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import type { SiteSettings } from '@/lib/settings';

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm backdrop-blur"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{settings.hero_badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              {settings.hero_title.includes('perfect clarity') ? (
                <>See the world in <span className="text-gradient">perfect clarity</span></>
              ) : (
                settings.hero_title
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              {settings.hero_subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild size="lg" className="rounded-full">
                <Link href="/book"><Calendar className="mr-2 h-5 w-5" /> Book Eye Test</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/products"><ShoppingBag className="mr-2 h-5 w-5" /> Shop Glasses</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="/contact"><Phone className="mr-2 h-5 w-5" /> Contact Us</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full border border-success/40 text-success hover:bg-success/10 hover:text-success">
                <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => {
                  const ids = [415829, 220453, 1239291, 697509];
                  return (
                    <div key={i} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-background">
                      <Image
                        src={`https://images.pexels.com/photos/${ids[i - 1]}/pexels-photo-${ids[i - 1]}.jpeg?auto=compress&cs=tinysrgb&w=120`}
                        alt="Customer"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
              <div>
                <StarRating rating={5} />
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Loved by <span className="font-semibold text-foreground">{Number(settings.stat_customers).toLocaleString()}+</span> happy customers
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/60 shadow-premium">
              <Image
                src={settings.hero_image}
                alt="Premium eyewear at Amir Optical Center"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-1/4 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-premium backdrop-blur sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Certified Optometrists</p>
                  <p className="text-xs text-muted-foreground">Trusted eye care</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -right-4 bottom-1/4 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-premium backdrop-blur sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Glasses className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">500+ Frames</p>
                  <p className="text-xs text-muted-foreground">Designer brands</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
