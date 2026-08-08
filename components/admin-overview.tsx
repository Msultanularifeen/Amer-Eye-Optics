'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, CalendarDays, Users, ShoppingBag, TrendingUp, AlertTriangle,
  Clock, ArrowRight, DollarSign,
} from 'lucide-react';
import { supabase, type Appointment, type Order, type Product } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AdminOverview() {
  const [stats, setStats] = useState({
    products: 0, appointments: 0, pendingAppts: 0, orders: 0, revenue: 0,
    lowStock: 0, patients: 0, todayAppts: 0,
  });
  const [recentAppts, setRecentAppts] = useState<Appointment[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [products, appts, pendingAppts, todayApptsData, orders, lowStock, profiles] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: false }),
        supabase.from('appointments').select('*', { count: 'exact', head: false }),
        supabase.from('appointments').select('*', { count: 'exact', head: false }).eq('status', 'pending'),
        supabase.from('appointments').select('*').eq('date', today).order('time', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*').lt('stock', 10).order('stock', { ascending: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: false }),
      ]);

      const allOrders = (orders.data ?? []) as Order[];
      const revenue = allOrders.reduce((s, o) => s + Number(o.total), 0);

      setStats({
        products: products.count ?? 0,
        appointments: appts.count ?? 0,
        pendingAppts: pendingAppts.count ?? 0,
        orders: orders.count ?? 0,
        revenue,
        lowStock: lowStock.data?.length ?? 0,
        patients: profiles.count ?? 0,
        todayAppts: todayApptsData.data?.length ?? 0,
      });
      setRecentAppts((appts.data ?? []) as Appointment[]);
      setRecentOrders(allOrders);
      setLowStockProducts((lowStock.data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'Today\'s Appointments', value: stats.todayAppts, icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Approvals', value: stats.pendingAppts, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Registered Patients', value: stats.patients, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  if (loading) {
    return <div className="grid place-items-center py-20 text-muted-foreground text-sm">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your optical center today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
              </div>
              <div className={cn('grid h-12 w-12 place-items-center rounded-xl', s.bg, s.color)}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-medium">Low Stock Alert ({lowStockProducts.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 6).map((p) => (
              <Badge key={p.id} variant="secondary" className={cn(p.stock <= 0 && 'bg-destructive/15 text-destructive')}>
                {p.name} — {p.stock} left
              </Badge>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
            <Link href="/admin/products">Manage inventory <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent appointments */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Recent Appointments</h3>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/appointments">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentAppts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.time}</p>
                </div>
                <ApptStatus status={a.status} />
              </div>
            ))}
            {recentAppts.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No appointments yet.</p>}
          </div>
        </Card>

        {/* Recent orders */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Recent Orders</h3>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/orders">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">#{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(Number(o.total))}</p>
                  <OrderStatus status={o.status} />
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ApptStatus({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: 'bg-warning/15 text-warning',
    confirmed: 'bg-primary/15 text-primary',
    completed: 'bg-success/15 text-success',
    cancelled: 'bg-destructive/15 text-destructive',
  };
  return <Badge className={cls[status] ?? cls.pending}><span className="capitalize">{status}</span></Badge>;
}

function OrderStatus({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: 'bg-warning/15 text-warning',
    processing: 'bg-primary/15 text-primary',
    shipped: 'bg-accent/15 text-accent',
    delivered: 'bg-success/15 text-success',
    cancelled: 'bg-destructive/15 text-destructive',
  };
  return <Badge className={cn('text-[11px]', cls[status] ?? cls.pending)}><span className="capitalize">{status}</span></Badge>;
}
