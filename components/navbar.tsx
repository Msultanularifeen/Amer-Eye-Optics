'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Glasses, Calendar, Phone, LayoutDashboard, LogOut, User,
  Shield, ShoppingBag, Eye, Stethoscope, FileText, Home, Info, Tag,
  ChevronDown, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const PRIMARY_LINKS: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: ShoppingBag },
  { href: '/lenses', label: 'Lenses', icon: Eye },
  { href: '/book', label: 'Eye Test', icon: Calendar },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Phone },
];

const MORE_LINKS: NavLink[] = [
  { href: '/services', label: 'Services', icon: Stethoscope },
  { href: '/offers', label: 'Offers', icon: Tag },
  { href: '/blog', label: 'Blog', icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isStaff = profile && profile.role !== 'customer';
  const isMoreActive = MORE_LINKS.some((l) => pathname === l.href);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass-strong shadow-premium' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow overflow-hidden transition group-hover:scale-105">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-full w-full object-cover" />
            ) : (
              <Glasses className="h-5 w-5" />
            )}
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            {settings.site_name?.split(' ')[0] ?? 'Amir'}{' '}
            <span className="text-gradient">{settings.site_name?.split(' ').slice(1).join(' ') || 'Optical'}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l.label}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              className={cn(
                'flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                isMoreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              More
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', moreOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
                >
                  <div className="glass-strong min-w-44 overflow-hidden rounded-2xl border border-border/60 p-1.5 shadow-premium">
                    {MORE_LINKS.map((l) => {
                      const active = pathname === l.href;
                      const Icon = l.icon;
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          className={cn(
                            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition',
                            active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant={isStaff ? 'secondary' : 'default'} className="rounded-full">
                <Link href={isStaff ? '/admin' : '/dashboard'}>
                  {isStaff ? <Shield className="mr-1.5 h-4 w-4" /> : <LayoutDashboard className="mr-1.5 h-4 w-4" />}
                  {isStaff ? 'Admin' : 'Dashboard'}
                </Link>
              </Button>
              <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out" className="rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/login">
                <User className="mr-1.5 h-4 w-4" /> Sign In
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="rounded-full shadow-glow">
            <Link href="/book">
              <Calendar className="mr-1.5 h-4 w-4" /> Book Eye Test
            </Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong absolute inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border/50 lg:hidden"
            >
              <div className="space-y-1 px-4 py-5">
                {[...PRIMARY_LINKS, ...MORE_LINKS].map((l, i) => {
                  const active = pathname === l.href;
                  const Icon = l.icon;
                  return (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={l.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                          active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className={cn('h-4.5 w-4.5', active ? 'text-primary' : 'text-muted-foreground')} />
                        {l.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="my-3 h-px bg-border/50" />

                {user ? (
                  <>
                    <Link
                      href={isStaff ? '/admin' : '/dashboard'}
                      className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
                    >
                      {isStaff ? <Shield className="h-4.5 w-4.5" /> : <LayoutDashboard className="h-4.5 w-4.5" />}
                      {isStaff ? 'Admin Panel' : 'My Dashboard'}
                    </Link>
                    <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <LogOut className="h-4.5 w-4.5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted">
                    <User className="h-4.5 w-4.5" /> Sign In
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild className="rounded-xl">
                    <Link href="/book"><Calendar className="mr-1.5 h-4 w-4" /> Book Eye Test</Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-xl">
                    <Link href="/contact"><Phone className="mr-1.5 h-4 w-4" /> Contact</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
