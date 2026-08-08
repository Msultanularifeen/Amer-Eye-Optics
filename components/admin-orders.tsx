'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShoppingBag, Filter, MessageCircle, Globe } from 'lucide-react';
import { supabase, type Order } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FLOW: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT: Order['payment_status'][] = ['unpaid', 'paid', 'refunded'];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Order marked ${status}`);
  };

  const updatePayment = async (id: string, payment_status: Order['payment_status']) => {
    const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, payment_status } : x)));
    toast.success('Payment status updated');
  };

  const statusCls: Record<string, string> = {
    pending: 'bg-warning/15 text-warning', processing: 'bg-primary/15 text-primary',
    shipped: 'bg-accent/15 text-accent', delivered: 'bg-success/15 text-success',
    cancelled: 'bg-destructive/15 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Order Management</h1>
          <p className="text-sm text-muted-foreground">{orders.length} orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] rounded-full"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUS_FLOW.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">#{o.order_number}</p>
                    <Badge className={statusCls[o.status]}><span className="capitalize">{o.status}</span></Badge>
                    <Badge variant="outline" className="capitalize">{o.payment_status}</Badge>
                    <Badge variant="secondary" className="gap-1">
                      {o.channel === 'whatsapp' ? <MessageCircle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {o.channel}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {o.customer_name} · {o.phone} {o.email ? `· ${o.email}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  {o.address && <p className="mt-1 text-xs text-muted-foreground">{o.address}</p>}
                  <div className="mt-3 space-y-1">
                    {(o.items as Array<{ name: string; quantity: number; price: number }>).map((item, i) => (
                      <p key={i} className="text-sm">{item.quantity}× {item.name} — {formatPrice(item.price)}</p>
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">{formatPrice(Number(o.total))}</p>
                </div>
                <div className="flex flex-col gap-2 lg:w-48">
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as Order['status'])}>
                    <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_FLOW.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={o.payment_status} onValueChange={(v) => updatePayment(o.id, v as Order['payment_status'])}>
                    <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
