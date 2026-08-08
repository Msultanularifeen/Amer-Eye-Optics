'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Share2, ShoppingCart, ZoomIn, Minus, Plus, Check, Truck, ShieldCheck, RotateCcw, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, type LensType, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useCart, type LensCustomization } from '@/lib/cart';
import { formatPrice, discountedPrice, discountPercent } from '@/lib/format';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SPH_OPTIONS = ['+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00', '+3.50', '+4.00', '+5.00', '+6.00', '-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.25', '-2.50', '-2.75', '-3.00', '-3.50', '-4.00', '-5.00', '-6.00'];
const CYL_OPTIONS = ['0.00', ...SPH_OPTIONS];

export function ProductDetail({ product, related, lensTypes }: { product: Product; related: Product[]; lensTypes: LensType[] }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [addLens, setAddLens] = useState(false);
  const [selectedLensId, setSelectedLensId] = useState<string>('');
  const [rx, setRx] = useState({ rs: '', rc: '', ra: '', ls: '', lc: '', la: '' });

  const price = discountedPrice(product.price, product.discount_price);
  const off = discountPercent(product.price, product.discount_price);
  const out = product.availability === 'out_of_stock' || product.stock <= 0;
  const images = product.images.length > 0 ? product.images : ['https://images.pexels.com/photos/2772531/pexels-photo-2772531.jpeg?auto=compress&cs=tinysrgb&w=800'];
  const selectedLens = lensTypes.find((l) => l.id === selectedLensId);
  const lensTotal = selectedLens ? selectedLens.price * qty : 0;

  const toggleWishlist = async () => {
    if (!user) { toast.error('Please sign in to save favorites'); return; }
    if (wished) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
      setWished(false); toast.success('Removed from wishlist');
    } else {
      const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
      if (error?.code === '23505') { setWished(true); toast.success('Already in your wishlist'); }
      else if (!error) { setWished(true); toast.success('Added to wishlist'); }
    }
  };

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success('Link copied to clipboard'); }
      catch { toast.error('Could not copy link'); }
    }
  };

  const addToCart = () => {
    if (out) { toast.error('This item is out of stock'); return; }
    if (addLens) {
      if (!selectedLens) { toast.error('Please select a lens type'); return; }
      if (!rx.rs || !rx.ls) { toast.error('Please enter SPH for both eyes'); return; }
      const lens: LensCustomization = {
        lensName: selectedLens.name,
        lensPrice: selectedLens.price,
        rightSphere: rx.rs,
        rightCylinder: rx.rc || '0.00',
        rightAxis: rx.ra || '',
        leftSphere: rx.ls,
        leftCylinder: rx.lc || '0.00',
        leftAxis: rx.la || '',
      };
      addItem(product, qty, lens);
    } else {
      addItem(product, qty);
    }
    toast.success(`${qty} × ${product.name}${addLens ? ' with lenses' : ''} added to cart`);
  };

  const itemTotal = price * qty + lensTotal;

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-border/60 bg-muted"
            onClick={() => setZoom(true)}
          >
            <Image
              src={images[activeImg]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur">
              <ZoomIn className="h-5 w-5" />
            </div>
            {off > 0 && (
              <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">-{off}%</Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'relative h-20 w-20 overflow-hidden rounded-xl border-2 transition',
                    activeImg === i ? 'border-primary' : 'border-border hover:border-primary/40'
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free delivery' },
              { icon: ShieldCheck, label: product.warranty },
              { icon: RotateCcw, label: '7-day returns' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 p-3 text-center">
                <b.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-primary">{product.brand}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{product.category}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} showValue />
            <span className="text-sm text-muted-foreground">{product.reviews_count} reviews</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-3xl font-semibold text-foreground">{formatPrice(price, product.currency)}</span>
            {off > 0 && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price, product.currency)}</span>
            )}
            {off > 0 && <Badge className="bg-success/15 text-success">Save {off}%</Badge>}
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {/* spec grid */}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Material', product.material],
              ['Frame Shape', product.frame_shape],
              ['Frame Size', product.frame_size],
              ['Lens Size', product.lens_size],
              ['Frame Color', product.frame_color],
              ['Lens Type', product.lens_type],
              ['Gender', product.gender],
              ['Prescription Ready', product.prescription_ready ? 'Yes' : 'No'],
            ].map(([k, v]) => v ? (
              <div key={k} className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium capitalize">{v}</span>
              </div>
            ) : null)}
          </div>

          {product.features.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          )}

          <Separator className="my-6" />

          {/* Optional: Add prescription lenses */}
          {lensTypes.length > 0 && (
            <div className="mb-6 rounded-xl border border-border/60 bg-card/40 p-4">
              <button
                onClick={() => setAddLens((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="h-4 w-4 text-primary" />
                  Add prescription lenses
                  <span className="text-xs font-normal text-muted-foreground">— optional</span>
                </span>
                <span className={cn('grid h-6 w-11 place-items-center rounded-full transition', addLens ? 'bg-primary' : 'bg-muted')}>
                  <span className={cn('h-5 w-5 rounded-full bg-background shadow transition', addLens ? 'translate-x-1' : '-translate-x-1')} />
                </span>
              </button>

              <AnimatePresence>
                {addLens && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">1. Choose lens type</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {lensTypes.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => setSelectedLensId(l.id)}
                              className={cn(
                                'flex items-center justify-between rounded-lg border-2 px-3 py-2 text-left text-sm transition',
                                selectedLensId === l.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {selectedLensId === l.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                                {l.name}
                              </span>
                              <span className="text-xs font-semibold text-primary">+{formatPrice(l.price)}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">2. Enter your prescription (SPH required)</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">R</span> Right Eye</p>
                            <div className="grid grid-cols-3 gap-2">
                              <RxField label="SPH*" value={rx.rs} onChange={(v) => setRx((p) => ({ ...p, rs: v }))} options={SPH_OPTIONS} />
                              <RxField label="CYL" value={rx.rc} onChange={(v) => setRx((p) => ({ ...p, rc: v }))} options={CYL_OPTIONS} />
                              <RxField label="AXIS" value={rx.ra} onChange={(v) => setRx((p) => ({ ...p, ra: v }))} numeric />
                            </div>
                          </div>
                          <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-3">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">L</span> Left Eye</p>
                            <div className="grid grid-cols-3 gap-2">
                              <RxField label="SPH*" value={rx.ls} onChange={(v) => setRx((p) => ({ ...p, ls: v }))} options={SPH_OPTIONS} />
                              <RxField label="CYL" value={rx.lc} onChange={(v) => setRx((p) => ({ ...p, lc: v }))} options={CYL_OPTIONS} />
                              <RxField label="AXIS" value={rx.la} onChange={(v) => setRx((p) => ({ ...p, la: v }))} numeric />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* availability + quantity + actions */}
          <div className="flex items-center gap-3">
            <span className={cn('text-sm font-medium', out ? 'text-destructive' : product.availability === 'low_stock' ? 'text-warning' : 'text-success')}>
              {out ? 'Out of stock' : product.availability === 'low_stock' ? `Low stock — only ${product.stock} left` : 'In stock'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-input">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid h-10 w-10 place-items-center" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={addToCart} disabled={out} size="lg" className="rounded-full flex-1 min-w-[140px]">
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button asChild disabled={out} size="lg" variant="secondary" className="rounded-full flex-1 min-w-[120px]">
              <Link href="/cart">Buy Now</Link>
            </Button>
            <Button onClick={toggleWishlist} variant="outline" size="icon" className="rounded-full h-12 w-12" aria-label="Wishlist">
              <Heart className={cn('h-5 w-5', wished && 'fill-destructive text-destructive')} />
            </Button>
            <Button onClick={share} variant="outline" size="icon" className="rounded-full h-12 w-12" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs: description / features / reviews */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6 prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </TabsContent>
          <TabsContent value="features" className="mt-6">
            <ul className="grid gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ReviewList productId={product.id} rating={product.rating} count={product.reviews_count} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <motion.div key={p.id} whileHover={{ y: -6 }} className="">
                <a href={`/products/${p.slug}`} className="group block overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={p.images[0] ?? ''}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(discountedPrice(p.price, p.discount_price), p.currency)}</p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {zoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setZoom(false)}>
          <div className="relative aspect-square max-h-[90vh] w-full max-w-3xl">
            <Image src={images[activeImg]} alt={product.name} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewList({ productId, rating, count }: { productId: string; rating: number; count: number }) {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-5">
        <div className="text-center">
          <p className="font-display text-4xl font-semibold">{Number(rating).toFixed(1)}</p>
          <StarRating rating={rating} className="mt-1 justify-center" />
          <p className="mt-1 text-xs text-muted-foreground">{count} reviews</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Be the first to share your experience with this product. Reviews help other customers make confident choices.
        </p>
      </div>
    </div>
  );
}

function RxField({ label, value, onChange, options, numeric }: { label: string; value: string; onChange: (v: string) => void; options?: string[]; numeric?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium text-muted-foreground">{label}</p>
      {numeric ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">—</option>
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </div>
  );
}
