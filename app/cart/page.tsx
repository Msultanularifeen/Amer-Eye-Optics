'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, MessageCircle, Loader2, Eye } from 'lucide-react';
import { useCart, itemKey, type CartItem } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatPrice, discountedPrice } from '@/lib/format';
import { SiteLayout } from '@/components/site-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clear, count } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [checkingOut, setCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const placeOrder = async (channel: 'online' | 'whatsapp') => {
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    setLoading(true);
    const orderNumber = `AO-${Date.now().toString().slice(-6)}`;
    const orderItems = items.map((i: CartItem) => {
      const basePrice = discountedPrice(i.product.price, i.product.discount_price);
      const lensPrice = i.lens ? i.lens.lensPrice : 0;
      const name = i.lens
        ? `${i.product.name} + ${i.lens.lensName} lenses`
        : i.product.name;
      return {
        name,
        quantity: i.quantity,
        price: basePrice + lensPrice,
        slug: i.product.slug,
        lens: i.lens ? {
          lensName: i.lens.lensName,
          rightSphere: i.lens.rightSphere,
          rightCylinder: i.lens.rightCylinder,
          rightAxis: i.lens.rightAxis,
          leftSphere: i.lens.leftSphere,
          leftCylinder: i.lens.leftCylinder,
          leftAxis: i.lens.leftAxis,
        } : null,
      };
    });
    const payload = {
      user_id: user?.id ?? null,
      order_number: orderNumber,
      items: orderItems,
      total,
      status: 'pending' as const,
      payment_status: 'unpaid' as const,
      channel,
      customer_name: form.name,
      phone: form.phone,
      email: form.email || null,
      address: form.address || null,
    };
    const { error } = await supabase.from('orders').insert(payload);
    if (error) { toast.error('Could not place order'); setLoading(false); return; }

    if (channel === 'whatsapp') {
      const itemLines = items.map((i) => {
        const basePrice = discountedPrice(i.product.price, i.product.discount_price);
        const lensPrice = i.lens ? i.lens.lensPrice : 0;
        const lensInfo = i.lens ? ` (with ${i.lens.lensName}: R ${i.lens.rightSphere}, L ${i.lens.leftSphere})` : '';
        return `${i.quantity}x ${i.product.name}${lensInfo} - ${formatPrice((basePrice + lensPrice) * i.quantity)}`;
      }).join('%0A');
      const msg = `New Order ${orderNumber}%0A%0A${itemLines}%0A%0ATotal: ${formatPrice(total)}%0A%0ACustomer: ${form.name}%0APhone: ${form.phone}%0A${form.address ? 'Address: ' + form.address : ''}`;
      window.open(`https://wa.me/${settings.whatsapp_number}?text=${msg}`, '_blank');
    }

    clear();
    setLoading(false);
    toast.success('Order placed successfully!');
    setCheckingOut(false);
  };

  if (count === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">Browse our collection and add frames you love.</p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/products">Shop Eyewear <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">{count} item{count !== 1 ? 's' : ''}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => {
                const key = itemKey(item);
                const basePrice = discountedPrice(item.product.price, item.product.discount_price);
                const lensPrice = item.lens ? item.lens.lensPrice : 0;
                const lineTotal = (basePrice + lensPrice) * item.quantity;
                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="flex gap-4 p-4">
                      <Link href={`/products/${item.product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={item.product.images[0] ?? ''} alt={item.product.name} fill sizes="96px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-primary line-clamp-1">{item.product.name}</Link>
                            <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                            {item.lens && (
                              <div className="mt-1.5 rounded-md bg-primary/8 px-2 py-1 text-[11px] text-primary">
                                <span className="flex items-center gap-1 font-medium"><Eye className="h-3 w-3" /> {item.lens.lensName} lenses</span>
                                <span className="mt-0.5 block text-muted-foreground">
                                  R: SPH {item.lens.rightSphere}{item.lens.rightCylinder !== '0.00' ? ` CYL ${item.lens.rightCylinder}` : ''}{item.lens.rightAxis ? ` AX ${item.lens.rightAxis}` : ''}
                                  {' · '}
                                  L: SPH {item.lens.leftSphere}{item.lens.leftCylinder !== '0.00' ? ` CYL ${item.lens.leftCylinder}` : ''}{item.lens.leftAxis ? ` AX ${item.lens.leftAxis}` : ''}
                                </span>
                                <span className="mt-0.5 block font-semibold">+{formatPrice(item.lens.lensPrice)}</span>
                              </div>
                            )}
                          </div>
                          <button onClick={() => removeItem(key)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-input">
                            <button onClick={() => updateQty(key, item.quantity - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQty(key, item.quantity + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <span className="font-display font-semibold">{formatPrice(lineTotal, item.product.currency)}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-success">Free</span></div>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4">
                <span className="font-medium">Total</span>
                <span className="font-display text-xl font-semibold">{formatPrice(total)}</span>
              </div>

              {!checkingOut ? (
                <Button onClick={() => setCheckingOut(true)} className="mt-6 w-full rounded-full" size="lg">
                  Proceed to Checkout
                </Button>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Address</Label>
                    <Textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => placeOrder('online')} disabled={loading} className="flex-1 rounded-full">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Place Order'}
                    </Button>
                    <Button onClick={() => placeOrder('whatsapp')} disabled={loading} variant="secondary" className="flex-1 rounded-full bg-success text-success-foreground hover:bg-success/90">
                      <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                    </Button>
                  </div>
                  <button onClick={() => setCheckingOut(false)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">Back to cart</button>
                </div>
              )}

              <Button asChild variant="ghost" className="mt-3 w-full rounded-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
