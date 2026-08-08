'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronRight, ChevronLeft, Loader2, Eye, ShoppingCart,
  Info, ShieldCheck, Truck, Glasses,
} from 'lucide-react';
import { supabase, type LensType, type Product } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { formatPrice, discountedPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 0 | 1 | 2 | 3;

export function LensOrderForm({ lensTypes, frames }: { lensTypes: LensType[]; frames: Product[] }) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [selectedLens, setSelectedLens] = useState<string>('');
  const [needFrame, setNeedFrame] = useState<'no' | 'own' | 'buy'>('no');
  const [selectedFrameId, setSelectedFrameId] = useState<string>('');
  const [frameText, setFrameText] = useState('');
  const [rx, setRx] = useState({
    right_sphere: '', right_cylinder: '', right_axis: '',
    left_sphere: '', left_cylinder: '', left_axis: '',
    pd_distance: '',
  });
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const lens = lensTypes.find((l) => l.id === selectedLens);
  const frame = frames.find((f) => f.id === selectedFrameId);
  const framePrice = frame ? discountedPrice(frame.price, frame.discount_price) : 0;
  const total = (lens?.price ?? 0) + framePrice;

  const steps = ['Lens Type', 'Prescription', 'Frame', 'Your Details'];

  const setRxField = (k: keyof typeof rx, v: string) => setRx((p) => ({ ...p, [k]: v }));
  const setFormField = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const sphereOptions = ['+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00', '+3.50', '+4.00', '+5.00', '+6.00', '-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.25', '-2.50', '-2.75', '-3.00', '-3.50', '-4.00', '-5.00', '-6.00'];
  const cylOptions = ['0.00', ...sphereOptions];

  const canNext = () => {
    if (step === 0) return !!selectedLens;
    if (step === 1) return !!rx.right_sphere && !!rx.left_sphere;
    if (step === 2) return needFrame !== 'buy' || !!selectedFrameId || !!frameText;
    if (step === 3) return !!form.name && !!form.phone;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    const payload = {
      user_id: user?.id ?? null,
      lens_type_id: selectedLens,
      lens_price: lens?.price ?? 0,
      frame: needFrame === 'buy'
        ? (frame ? `${frame.name}` : frameText || 'Frame to choose')
        : needFrame === 'own' ? 'Customer has own frame' : null,
      frame_product_id: needFrame === 'buy' && frame ? frame.id : null,
      frame_name: needFrame === 'buy' && frame ? frame.name : (needFrame === 'buy' ? frameText : null),
      frame_price: needFrame === 'buy' && frame ? framePrice : 0,
      frame_image: needFrame === 'buy' && frame ? (frame.images[0] ?? null) : null,
      right_sphere: rx.right_sphere,
      right_cylinder: rx.right_cylinder || '0.00',
      right_axis: rx.right_axis || '',
      left_sphere: rx.left_sphere,
      left_cylinder: rx.left_cylinder || '0.00',
      left_axis: rx.left_axis || '',
      pd_distance: rx.pd_distance || null,
      customer_name: form.name,
      phone: form.phone,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
      status: 'pending' as const,
    };
    const { error } = await supabase.from('lens_orders').insert(payload);
    setLoading(false);
    if (error) { toast.error('Could not place order. Please try again.'); return; }
    setDone(true);
    toast.success('Lens order placed!');
  };

  if (done) {
    return (
      <Card className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success"
        >
          <Check className="h-10 w-10" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold">Order Placed!</h2>
        <p className="mt-2 text-muted-foreground">We received your lens order. Our team will call you to confirm the details.</p>
        <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-border/60 bg-card/60 p-5 text-left text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Lens</span><span className="font-medium">{lens?.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Right Eye (SPH)</span><span className="font-medium">{rx.right_sphere}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Left Eye (SPH)</span><span className="font-medium">{rx.left_sphere}</span></div>
          {frame && <div className="flex justify-between"><span className="text-muted-foreground">Frame</span><span className="font-medium">{frame.name}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{form.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{form.phone}</span></div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition',
              i < step ? 'bg-success text-success-foreground' :
              i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('hidden text-sm sm:block', i === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Lens Type */}
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lensTypes.map((lens, i) => (
                <motion.button
                  key={lens.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelectedLens(lens.id); setStep(1); }}
                  className={cn(
                    'group text-left rounded-2xl border-2 p-0 overflow-hidden transition',
                    selectedLens === lens.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {lens.image ? (
                      <Image src={lens.image} alt={lens.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><Eye className="h-12 w-12" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{lens.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{lens.description}</p>
                    <ul className="mt-3 space-y-1">
                      {lens.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-display text-lg font-semibold text-primary">{formatPrice(lens.price)}</span>
                      <Badge variant="secondary">Select</Badge>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Step 2: Prescription */}
          {step === 1 && (
            <Card className="max-w-2xl p-6">
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-primary/5 p-4">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Enter your prescription numbers</p>
                  <p className="mt-1">Find these numbers on your prescription paper. SPH (sphere) is required. If you don&apos;t know CYL or AXIS, leave them empty.</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Right Eye */}
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-primary-foreground">R</span>
                    Right Eye (OD)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">SPH (Sphere) * — like +2.00 or -1.50</Label>
                      <RxSelect value={rx.right_sphere} onChange={(v) => setRxField('right_sphere', v)} options={sphereOptions} placeholder="Select SPH" />
                    </div>
                    <div>
                      <Label className="text-xs">CYL (Cylinder) — for astigmatism</Label>
                      <RxSelect value={rx.right_cylinder} onChange={(v) => setRxField('right_cylinder', v)} options={cylOptions} placeholder="Select CYL" />
                    </div>
                    <div>
                      <Label className="text-xs">AXIS — number 1-180</Label>
                      <Input type="number" min={1} max={180} value={rx.right_axis} onChange={(e) => setRxField('right_axis', e.target.value)} placeholder="e.g. 90" />
                    </div>
                  </div>
                </div>

                {/* Left Eye */}
                <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-display font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs text-accent-foreground">L</span>
                    Left Eye (OS)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">SPH (Sphere) * — like +2.00 or -1.50</Label>
                      <RxSelect value={rx.left_sphere} onChange={(v) => setRxField('left_sphere', v)} options={sphereOptions} placeholder="Select SPH" />
                    </div>
                    <div>
                      <Label className="text-xs">CYL (Cylinder) — for astigmatism</Label>
                      <RxSelect value={rx.left_cylinder} onChange={(v) => setRxField('left_cylinder', v)} options={cylOptions} placeholder="Select CYL" />
                    </div>
                    <div>
                      <Label className="text-xs">AXIS — number 1-180</Label>
                      <Input type="number" min={1} max={180} value={rx.left_axis} onChange={(e) => setRxField('left_axis', e.target.value)} placeholder="e.g. 90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 max-w-xs">
                <Label className="text-xs">PD (Pupillary Distance) — optional</Label>
                <Input value={rx.pd_distance} onChange={(e) => setRxField('pd_distance', e.target.value)} placeholder="e.g. 62mm" />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Don&apos;t have a prescription? Book an eye test and our doctor will check your eyes.
              </p>
            </Card>
          )}

          {/* Step 3: Frame */}
          {step === 2 && (
            <Card className="max-w-2xl p-6">
              <h3 className="font-display text-lg font-semibold">Do you need a frame?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose whether you want us to fit the lenses in a frame you already have, or pick a frame from our shop.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'no', title: 'Lenses Only', desc: 'Just the lenses, no frame', icon: Eye },
                  { id: 'own', title: 'I Have a Frame', desc: 'I\'ll bring my own frame', icon: ShieldCheck },
                  { id: 'buy', title: 'Pick a Frame', desc: 'Choose from our shop', icon: Glasses },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setNeedFrame(opt.id as typeof needFrame)}
                    className={cn(
                      'text-left rounded-xl border-2 p-4 transition',
                      needFrame === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <opt.icon className="h-6 w-6 text-primary" />
                    <p className="mt-2 font-medium text-sm">{opt.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {needFrame === 'buy' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                  <h4 className="mb-3 font-display font-semibold">Pick a frame from our shop</h4>
                  <div className="grid max-h-80 gap-3 overflow-y-auto rounded-xl border border-border/60 p-3 sm:grid-cols-3">
                    {frames.map((f) => {
                      const fp = discountedPrice(f.price, f.discount_price);
                      const sel = selectedFrameId === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFrameId(f.id)}
                          className={cn(
                            'group overflow-hidden rounded-xl border-2 text-left transition',
                            sel ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                          )}
                        >
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            {f.images[0] ? (
                              <Image src={f.images[0]} alt={f.name} fill sizes="120px" className="object-cover transition group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground"><Glasses className="h-8 w-8" /></div>
                            )}
                            {sel && (
                              <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="line-clamp-1 text-xs font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.brand}</p>
                            <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(fp, f.currency)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="text-muted-foreground">Can&apos;t find it? Describe the frame:</span>
                    <Input value={frameText} onChange={(e) => { setFrameText(e.target.value); setSelectedFrameId(''); }} placeholder="Or type frame name" className="ml-2 max-w-52 h-8" />
                  </div>
                </motion.div>
              )}
            </Card>
          )}

          {/* Step 4: Details */}
          {step === 3 && (
            <Card className="max-w-2xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={(e) => setFormField('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={(e) => setFormField('phone', e.target.value)} placeholder="+92 300 1234567" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setFormField('email', e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setFormField('address', e.target.value)} placeholder="Delivery address" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Textarea value={form.notes} onChange={(e) => setFormField('notes', e.target.value)} rows={2} placeholder="Any special requests..." />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 rounded-xl border border-border/60 bg-card/60 p-5">
                <h4 className="mb-3 font-medium">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Lens Type</span><span className="font-medium">{lens?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Right Eye</span><span className="font-medium">SPH {rx.right_sphere}{rx.right_cylinder && ` · CYL ${rx.right_cylinder}`}{rx.right_axis && ` · AX ${rx.right_axis}`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Left Eye</span><span className="font-medium">SPH {rx.left_sphere}{rx.left_cylinder && ` · CYL ${rx.left_cylinder}`}{rx.left_axis && ` · AX ${rx.left_axis}`}</span></div>
                  {rx.pd_distance && <div className="flex justify-between"><span className="text-muted-foreground">PD</span><span className="font-medium">{rx.pd_distance}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Frame</span><span className="font-medium">{needFrame === 'no' ? 'Lenses only' : needFrame === 'own' ? 'Own frame' : frame ? frame.name : frameText || 'To choose'}</span></div>
                  {frame && <div className="flex justify-between"><span className="text-muted-foreground">Frame Price</span><span className="font-medium">{formatPrice(framePrice, frame.currency)}</span></div>}
                  <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Total</span><span className="font-display text-lg font-semibold text-primary">{formatPrice(total)}</span></div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1) as Step)} disabled={step === 0} className="rounded-full">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canNext()} className="rounded-full">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={loading || !canNext()} className="rounded-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {loading ? 'Placing Order...' : 'Place Lens Order'}
          </Button>
        )}
      </div>

      {/* Trust badges */}
      <div className="mt-12 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: 'Expert checked' },
          { icon: Truck, label: 'Free delivery' },
          { icon: Eye, label: 'Quality lenses' },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/40 p-4">
            <b.icon className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RxSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
