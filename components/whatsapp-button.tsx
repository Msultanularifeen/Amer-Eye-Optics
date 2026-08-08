'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/use-site-settings';

export function WhatsAppButton() {
  const { settings } = useSiteSettings();

  return (
    <motion.a
      href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20Amir%20Optical%20Center`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/30"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-success/40" />
    </motion.a>
  );
}
