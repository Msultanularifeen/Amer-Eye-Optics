'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, CalendarDays, Users, ShoppingBag, BarChart3,
  Settings, LogOut, Glasses, Loader2, Menu, X, Shield, Percent, FileText,
  Stethoscope, UserCog, Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles?: string[] };

// Default: all staff roles see these. roles array restricts to specific roles.
const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['owner', 'sales'] },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays, roles: ['owner', 'receptionist', 'doctor'] },
  { href: '/admin/patients', label: 'Patients', icon: Users, roles: ['owner', 'receptionist', 'doctor'] },
  { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope, roles: ['owner', 'doctor'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['owner', 'receptionist', 'sales'] },
  { href: '/admin/lenses', label: 'Lens Orders', icon: Eye, roles: ['owner', 'receptionist', 'sales'] },
  { href: '/admin/offers', label: 'Offers', icon: Percent, roles: ['owner'] },
  { href: '/admin/blog', label: 'Blog', icon: FileText, roles: ['owner'] },
  { href: '/admin/staff', label: 'Staff & Users', icon: UserCog, roles: ['owner'] },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings, roles: ['owner'] },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (profile && profile.role === 'customer') { router.push('/dashboard'); return; }
    // Role-based route guard
    if (profile) {
      const currentNav = NAV.find((n) => n.href === pathname);
      if (currentNav?.roles && !currentNav.roles.includes(profile.role)) {
        router.push('/admin');
      }
    }
  }, [loading, user, profile, router, pathname]);

  if (loading || !user || (profile && profile.role === 'customer')) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Glasses className="h-4 w-4" />
          </div>
          <span className="font-display font-semibold">Admin</span>
        </Link>
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border/60 bg-card transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Glasses className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight">Amir Optical</p>
              <p className="text-[11px] text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
        </div>

        <div className="px-3 py-4">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <p className="font-medium">{profile.full_name}</p>
              <p className="capitalize text-muted-foreground">{profile.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-border/60 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            <Glasses className="h-4 w-4" /> View Store
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Content */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
