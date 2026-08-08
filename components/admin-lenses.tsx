'use client';

import { useEffect, useState } from 'react';
import {
  Eye, Check, X, Clock, Loader2, Phone, Mail, MapPin, Filter, Trash2,
} from 'lucide-react';
import { supabase, type LensType } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LensOrderWithLens = {
  id: string;
  user_id: string | null;
  lens_type_id: string;
  frame: string | null;
  frame_product_id: string | null;
  frame_name: string | null;
  frame_price: number;
  frame_image: string | null;
  lens_price: number;
  right_sphere: string;
  right_cylinder: string;
  right_axis: string;
  left_sphere: string;
  left_cylinder: string;
  left_axis: string;
  pd_distance: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  lens: LensType;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  confirmed: 'bg-primary/15 text-primary',
  processing: 'bg-accent/15 text-accent',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
};

export function AdminLenses() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<LensOrderWithLens[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState<LensOrderWithLens | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('lens_orders')
      .select('*, lens:lens_types(*)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setOrders((data ?? []) as LensOrderWithLens[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('lens_orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order ${status}`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as LensOrderWithLens['status'] } : o)));
    if (detail?.id === id) setDetail({ ...detail, status: status as LensOrderWithLens['status'] });
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('lens_orders').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success('Order deleted');
  };

  const statuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Lens Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage prescription lens orders from customers.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 rounded-full"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Eye className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No lens orders yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Eye className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{o.lens?.name ?? 'Lens'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <Badge className={cn('ml-2 capitalize', STATUS_STYLES[o.status])}>{o.status}</Badge>
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">R</span> Right Eye
                      </p>
                      <p className="font-mono text-sm">SPH {o.right_sphere}{o.right_cylinder && o.right_cylinder !== '0.00' ? ` · CYL ${o.right_cylinder}` : ''}{o.right_axis ? ` · AX ${o.right_axis}` : ''}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">L</span> Left Eye
                      </p>
                      <p className="font-mono text-sm">SPH {o.left_sphere}{o.left_cylinder && o.left_cylinder !== '0.00' ? ` · CYL ${o.left_cylinder}` : ''}{o.left_axis ? ` · AX ${o.left_axis}` : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{o.customer_name}</span></p>
                    <p className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {o.phone}</p>
                    {o.email && <p className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {o.email}</p>}
                    {o.frame && (
                      <div className="mt-2 flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                        {o.frame_image ? (
                          <img src={o.frame_image} alt={o.frame_name ?? 'Frame'} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground"><Eye className="h-5 w-5" /></div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground">{o.frame_name ?? o.frame}</p>
                          {o.frame_price > 0 && <p className="text-xs text-muted-foreground">+{formatPrice(o.frame_price)}</p>}
                        </div>
                      </div>
                    )}
                    {o.notes && <p className="text-muted-foreground"><span className="text-foreground/70">Notes:</span> {o.notes}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="space-y-0.5 text-right">
                    {o.frame_price > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <div>Lens: {formatPrice(o.lens_price || o.lens?.price || 0)}</div>
                        <div>Frame: {formatPrice(o.frame_price)}</div>
                      </div>
                    )}
                    <span className="font-display text-lg font-semibold text-primary">{formatPrice((o.lens_price || o.lens?.price || 0) + (o.frame_price || 0))}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetail(o)} className="rounded-full">Details</Button>
                    {o.status === 'pending' && (
                      <Button size="sm" onClick={() => updateStatus(o.id, 'confirmed')} className="rounded-full bg-success text-success-foreground hover:bg-success/90">
                        <Check className="mr-1 h-4 w-4" /> Confirm
                      </Button>
                    )}
                    {o.status === 'confirmed' && (
                      <Button size="sm" onClick={() => updateStatus(o.id, 'processing')} className="rounded-full">
                        <Clock className="mr-1 h-4 w-4" /> Start
                      </Button>
                    )}
                    {o.status === 'processing' && (
                      <Button size="sm" onClick={() => updateStatus(o.id, 'completed')} className="rounded-full bg-success text-success-foreground hover:bg-success/90">
                        <Check className="mr-1 h-4 w-4" /> Complete
                      </Button>
                    )}
                    {(o.status === 'pending' || o.status === 'confirmed') && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'cancelled')} className="rounded-full text-destructive hover:bg-destructive/10">
                        <X className="mr-1 h-4 w-4" /> Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => del(o.id)} className="rounded-full text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lens Order Details</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{detail.lens?.name}</span>
                <Badge className={cn('capitalize', STATUS_STYLES[detail.status])}>{detail.status}</Badge>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 font-medium">Prescription</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Right Eye (OD)</p>
                    <p className="font-mono">SPH: {detail.right_sphere}</p>
                    {detail.right_cylinder && detail.right_cylinder !== '0.00' && <p className="font-mono text-xs">CYL: {detail.right_cylinder}</p>}
                    {detail.right_axis && <p className="font-mono text-xs">AXIS: {detail.right_axis}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Left Eye (OS)</p>
                    <p className="font-mono">SPH: {detail.left_sphere}</p>
                    {detail.left_cylinder && detail.left_cylinder !== '0.00' && <p className="font-mono text-xs">CYL: {detail.left_cylinder}</p>}
                    {detail.left_axis && <p className="font-mono text-xs">AXIS: {detail.left_axis}</p>}
                  </div>
                </div>
                {detail.pd_distance && <p className="mt-2 font-mono text-xs">PD: {detail.pd_distance}</p>}
              </div>
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{detail.customer_name}</span></p>
                <p className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-muted-foreground" /> {detail.phone}</p>
                {detail.email && <p className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" /> {detail.email}</p>}
                {detail.address && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-muted-foreground" /> {detail.address}</p>}
                {detail.frame && <p><span className="text-muted-foreground">Frame:</span> {detail.frame}</p>}
                {detail.notes && <p><span className="text-muted-foreground">Notes:</span> {detail.notes}</p>}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Price</span>
                <span className="font-display text-xl font-semibold text-primary">{formatPrice(detail.lens?.price ?? 0)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Select value={detail?.status} onValueChange={(v) => detail && updateStatus(detail.id, v)}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setDetail(null)} className="rounded-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
