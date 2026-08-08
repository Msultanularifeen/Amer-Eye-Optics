import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { DeveloperPopup } from '@/components/developer-credit';

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
      <WhatsAppButton />
      <DeveloperPopup />
    </>
  );
}
