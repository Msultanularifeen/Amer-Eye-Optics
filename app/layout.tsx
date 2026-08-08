import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthInit } from '@/components/auth-init';
import { CartProvider } from '@/lib/cart';
import { getSiteSettings } from '@/lib/settings';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.site_name || 'Amir Optical Center';
  return {
    metadataBase: new URL('https://amiroptical.example.com'),
    title: {
      default: `${siteName} — Premium Eye Care & Eyewear`,
      template: `%s | ${siteName}`,
    },
    description:
      'Premium eye examinations, designer eyewear, contact lenses, and expert consultation. Book your appointment today.',
    keywords: [
      'optical center', 'eye test', 'eyewear', 'glasses', 'contact lenses',
      'sunglasses', 'eye examination', 'optometrist', 'Amir Optical',
    ],
    icons: settings.favicon_url ? { icon: settings.favicon_url, shortcut: settings.favicon_url } : undefined,
    openGraph: {
      title: `${siteName} — Premium Eye Care & Eyewear`,
      description: 'Premium eye examinations, designer eyewear, and expert consultation.',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: 'Premium eye care & eyewear.',
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${sora.variable} font-sans antialiased`}>
        <ThemeProvider>
          <CartProvider>
            <AuthInit />
            {children}
            <Toaster richColors position="top-right" />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
