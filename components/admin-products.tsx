'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, X, Package } from 'lucide-react';
import { supabase, type Product, CATEGORIES } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/image-upload';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMPTY: Partial<Product> = {
  name: '', slug: '', category: 'Sunglasses', gender: 'unisex', type: '', brand: '',
  material: '', frame_shape: '', frame_size: '', lens_size: '', frame_color: '',
  price: 0, discount_price: null, currency: 'PKR', stock: 0, availability: 'in_stock',
  warranty: '1 Year', sku: '', barcode: '', supplier: '', purchase_cost: 0,
  images: [], description: '', features: [], prescription_ready: false, lens_type: '',
  rating: 5, reviews_count: 0, is_featured: false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY);
    setFeatureInput('');
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm(p);
    setFeatureInput('');
    setOpen(true);
  };

  const set = (k: keyof Product, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const removeImage = (i: number) => set('images', (form.images ?? []).filter((_, idx) => idx !== i));

  const addFeature = () => {
    if (!featureInput.trim()) return;
    set('features', [...(form.features ?? []), featureInput.trim()]);
    setFeatureInput('');
  };
  const removeFeature = (i: number) => set('features', (form.features ?? []).filter((_, idx) => idx !== i));

  const save = async () => {
    if (!form.name || !form.category || form.price == null) {
      toast.error('Name, category, and price are required');
      return;
    }
    setSaving(true);
    const stock = Number(form.stock ?? 0);
    const availability = stock <= 0 ? 'out_of_stock' : stock < 10 ? 'low_stock' : 'in_stock';
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name!),
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock,
      availability,
      purchase_cost: Number(form.purchase_cost ?? 0),
      images: form.images ?? [],
      features: form.features ?? [],
    };
    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Product added');
    }
    setSaving(false);
    setOpen(false);
    load();
  };

  const del = async (p: Product) => {
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Product deleted');
    setConfirmDelete(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground">{products.length} products in inventory</p>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, brand, SKU..." className="pl-9 rounded-full" />
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/40">
                <tr className="text-left">
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 font-medium">{formatPrice(Number(p.discount_price ?? p.price))}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <Badge className={cn(
                        p.availability === 'out_of_stock' && 'bg-destructive/15 text-destructive',
                        p.availability === 'low_stock' && 'bg-warning/15 text-warning',
                        p.availability === 'in_stock' && 'bg-success/15 text-success',
                      )}>
                        <span className="capitalize">{p.availability.replace('_', ' ')}</span>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(p)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name *</Label>
              <Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['men', 'women', 'kids', 'unisex'].map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={form.type ?? ''} onChange={(e) => set('type', e.target.value)} placeholder="Sunglasses, Prescription..." />
            </div>
            <div className="space-y-2">
              <Label>Price (PKR) *</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Discount Price</Label>
              <Input type="number" value={form.discount_price ?? ''} onChange={(e) => set('discount_price', e.target.value || null)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" value={form.stock ?? 0} onChange={(e) => set('stock', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={form.material ?? ''} onChange={(e) => set('material', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frame Shape</Label>
              <Input value={form.frame_shape ?? ''} onChange={(e) => set('frame_shape', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frame Color</Label>
              <Input value={form.frame_color ?? ''} onChange={(e) => set('frame_color', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frame Size</Label>
              <Input value={form.frame_size ?? ''} onChange={(e) => set('frame_size', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lens Type</Label>
              <Input value={form.lens_type ?? ''} onChange={(e) => set('lens_type', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier ?? ''} onChange={(e) => set('supplier', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Cost</Label>
              <Input type="number" value={form.purchase_cost ?? 0} onChange={(e) => set('purchase_cost', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Warranty</Label>
              <Input value={form.warranty ?? ''} onChange={(e) => set('warranty', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={3} />
            </div>

            {/* Images */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Product Images</Label>
              <ImageUpload
                label="Add product image"
                value=""
                onChange={(url) => { if (url) set('images', [...(form.images ?? []), url]); }}
                aspectRatio="4:3"
                folder="products"
              />
              {form.images && form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-destructive text-destructive-foreground"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="e.g. UV400 protection" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <Button type="button" onClick={addFeature} size="sm"><Plus className="h-4 w-4" /></Button>
              </div>
              {form.features && form.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {f}
                      <button onClick={() => removeFeature(i)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.prescription_ready ?? false} onChange={(e) => set('prescription_ready', e.target.checked)} className="accent-primary" />
                Prescription Ready
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => set('is_featured', e.target.checked)} className="accent-primary" />
                Featured Product
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-full">Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && del(confirmDelete)} className="rounded-full">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
