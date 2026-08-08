'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Percent, X } from 'lucide-react';
import { supabase, type Offer } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

const EMPTY: Partial<Offer> = {
  title: '', description: '', code: '', discount_type: 'percentage',
  discount_value: 10, valid_until: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  is_active: true,
};

export function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Offer>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('offers').select('*').order('valid_until', { ascending: false });
    setOffers((data ?? []) as Offer[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (o: Offer) => { setEditId(o.id); setForm(o); setOpen(true); };
  const set = (k: keyof Offer, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title || !form.code || !form.valid_until) { toast.error('Title, code, and validity are required'); return; }
    setSaving(true);
    const payload = { ...form, discount_value: Number(form.discount_value) };
    if (editId) {
      const { error } = await supabase.from('offers').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Offer updated');
    } else {
      const { error } = await supabase.from('offers').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Offer created');
    }
    setSaving(false); setOpen(false); load();
  };

  const del = async (o: Offer) => {
    const { error } = await supabase.from('offers').delete().eq('id', o.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Offer deleted'); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Offers & Discounts</h1>
          <p className="text-sm text-muted-foreground">{offers.length} offers</p>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Offer</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : offers.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <Percent className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No offers yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between">
                <Badge className={o.is_active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}>
                  {o.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(o)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(o)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <h3 className="mt-2 font-display font-semibold">{o.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <code className="rounded bg-secondary px-2 py-1 text-sm font-semibold">{o.code}</code>
                <span className="text-sm font-semibold text-primary">
                  {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `${formatPrice(Number(o.discount_value))} OFF`}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Valid until {new Date(o.valid_until).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Offer' : 'Add Offer'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Code *</Label><Input value={form.code ?? ''} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="SAVE20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => set('discount_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Value</Label><Input type="number" value={form.discount_value ?? 0} onChange={(e) => set('discount_value', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Valid Until *</Label><Input type="date" value={form.valid_until ?? ''} onChange={(e) => set('valid_until', e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set('is_active', e.target.checked)} className="accent-primary" />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
