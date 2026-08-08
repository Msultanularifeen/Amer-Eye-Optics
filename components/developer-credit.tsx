'use client';

import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Code2, MessageCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DeveloperPopup() {
  const { settings } = useSiteSettings();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && sessionStorage.getItem('dev_popup_seen');
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setShow(false);
    if (typeof window !== 'undefined') sessionStorage.setItem('dev_popup_seen', '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:bg-background hover:scale-110"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Big gradient banner with photo */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary/70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
              {/* Decorative floating shapes */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-8 top-6 h-16 w-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur"
              />
              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute right-24 top-12 h-10 w-10 rounded-full border border-white/20 bg-white/10 backdrop-blur"
              />

              {/* Big photo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 18 }}
                className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 translate-y-12"
              >
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-card bg-gradient-to-br from-primary to-accent shadow-2xl">
                  {settings.developer_photo ? (
                    <img src={settings.developer_photo} alt={settings.developer_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-primary-foreground">
                      {settings.developer_name.charAt(0)}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-6 pb-7 pt-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" /> {settings.developer_title}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{settings.developer_name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{settings.developer_bio}</p>
              </motion.div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex flex-wrap justify-center gap-2"
              >
                {['Web Design', 'Development', 'Business Sites'].map((tag) => (
                  <span key={tag} className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{tag}</span>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 space-y-3"
              >
                {settings.developer_whatsapp && (
                  <a
                    href={`https://wa.me/${settings.developer_whatsapp}?text=Hi%20${encodeURIComponent(settings.developer_name)},%20I%20saw%20your%20work%20on%20Amir%20Optical%20and%20I'd%20like%20a%20website%20for%20my%20business.`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={close}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-success px-4 py-3.5 text-sm font-semibold text-success-foreground shadow-lg shadow-success/20 transition hover:shadow-xl hover:shadow-success/30 hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5 transition group-hover:scale-110" />
                    Get a website like this
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </a>
                )}
                <button onClick={close} className="text-xs text-muted-foreground transition hover:text-foreground">
                  Continue to site
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
