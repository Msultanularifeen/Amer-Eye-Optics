'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, Package, CalendarDays, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/format';

const COLORS = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)'];

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<{ name: string; revenue: number; orders: number }[]>([]);
  const [apptData, setApptData] = useState<{ name: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; stock: number }[]>([]);
  const [categoryDist, setCategoryDist] = useState<{ name: string; value: number }[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, orders: 0, products: 0, appts: 0 });

  useEffect(() => {
    (async () => {
      const [orders, products, appts] = await Promise.all([
        supabase.from('orders').select('created_at, total, status'),
        supabase.from('products').select('name, stock, category'),
        supabase.from('appointments').select('date, status'),
      ]);

      // Sales by month (last 6 months)
      const now = new Date();
      const months: { name: string; revenue: number; orders: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const monthOrders = (orders.data ?? []).filter((o) => {
          const od = new Date(o.created_at);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        });
        months.push({
          name: label,
          revenue: monthOrders.reduce((s, o) => s + Number(o.total), 0),
          orders: monthOrders.length,
        });
      }
      setSalesData(months);

      // Appointments by status
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      setApptData(statuses.map((s) => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        count: (appts.data ?? []).filter((a) => a.status === s).length,
      })));

      // Top products by stock (proxy for inventory)
      const prods = (products.data ?? []) as Array<{ name: string; stock: number; category: string }>;
      setTopProducts(prods.slice(0, 5).map((p) => ({ name: p.name, stock: p.stock })));

      // Category distribution
      const catMap = new Map<string, number>();
      prods.forEach((p) => catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1));
      setCategoryDist(Array.from(catMap.entries()).map(([name, value]) => ({ name, value })));

      setTotals({
        revenue: (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0),
        orders: orders.data?.length ?? 0,
        products: products.data?.length ?? 0,
        appts: appts.data?.length ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(totals.revenue), icon: TrendingUp },
    { label: 'Total Orders', value: totals.orders, icon: Package },
    { label: 'Appointments', value: totals.appts, icon: CalendarDays },
    { label: 'Products', value: totals.products, icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your performance over time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-medium mb-4">Revenue & Orders (6 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Revenue" />
              <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-medium mb-4">Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={apptData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-medium mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {categoryDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-medium mb-4">Top Products (by inventory)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={120} className="text-xs" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="stock" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
