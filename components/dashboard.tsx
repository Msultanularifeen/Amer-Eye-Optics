'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Heart, FileText, User, Loader2, LogOut, Plus,
  Clock, CheckCircle2, XCircle, Trash2, Upload, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type Appointment, type Product, type Prescription, type Order } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice, discountedPrice } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type WishlistRow = { id: string; product_id: string; product: Product };

export function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState(params.get('tab') || 'appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [wishlist, setWishlist] = useState<WishlistRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    (async () => {
      const [appts, wish, rx, ord] = await Promise.all([
        supabase.from('appointments').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('wishlist').select('id, product_id, product:products(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('prescriptions').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setAppointments((appts.data ?? []) as Appointment[]);
      setWishlist((wish.data ?? []) as unknown as WishlistRow[]);
      setPrescriptions((rx.data ?? []) as Prescription[]);
      setOrders((ord.data ?? []) as Order[]);
      setDataLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (profile) { setName(profile.full_name); setPhone(profile.phone ?? ''); }
  }, [profile]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', user.id);
    if (error) { toast.error('Could not save changes'); return; }
    await refreshProfile();
    setEditing(false);
    toast.success('Profile updated');
  };

  const uploadRx = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('prescriptions').upload(path, file);
    if (upErr) { toast.error('Upload failed'); return; }
    const { data } = supabase.storage.from('prescriptions').getPublicUrl(path);
    const { error } = await supabase.from('prescriptions').insert({
      user_id: user.id, file_url: data.publicUrl, file_name: file.name,
    });
    if (error) { toast.error('Could not save prescription'); return; }
    toast.success('Prescription uploaded');
    const { data: rxData } = await supabase.from('prescriptions').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false });
    setPrescriptions((rxData ?? []) as Prescription[]);
  };

  const removeWish = async (id: string) => {
    await supabase.from('wishlist').delete().eq('id', id);
    setWishlist((w) => w.filter((x) => x.id !== id));
    toast.success('Removed from wishlist');
  };

  const cancelAppt = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)));
    toast.success('Appointment cancelled');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-semibold text-primary-foreground">
            {(profile?.full_name?.[0] ?? 'U').toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">{profile?.full_name ?? 'Welcome'}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={signOut} className="rounded-full self-start">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
          <TabsTrigger value="appointments" className="rounded-lg"><Calendar className="mr-1.5 h-4 w-4" /> Appointments</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg"><ShoppingBag className="mr-1.5 h-4 w-4" /> Orders</TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-lg"><Heart className="mr-1.5 h-4 w-4" /> Wishlist</TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-lg"><FileText className="mr-1.5 h-4 w-4" /> Prescriptions</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg"><User className="mr-1.5 h-4 w-4" /> Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Your Appointments</h2>
            <Button asChild size="sm" className="rounded-full"><Link href="/book"><Plus className="mr-1 h-4 w-4" /> Book New</Link></Button>
          </div>
          {dataLoading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : appointments.length === 0 ? (
            <EmptyState icon={Calendar} title="No appointments yet" body="Book your first eye examination today." action={<Button asChild className="rounded-full"><Link href="/book">Book Now</Link></Button>} />
          ) : (
            <div className="grid gap-4">
              {appointments.map((a) => (
                <Card key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{a.date} · {a.time}</p>
                      <p className="text-sm text-muted-foreground">{a.patient_name} · {a.reason || 'Eye examination'}</p>
                      <div className="mt-1.5">
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                  </div>
                  {a.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => cancelAppt(a.id)} className="rounded-full">
                      <XCircle className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <h2 className="font-display text-xl font-semibold mb-4">Your Orders</h2>
          {dataLoading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : orders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" body="Your placed orders will appear here." action={<Button asChild className="rounded-full"><Link href="/products">Shop Now</Link></Button>} />
          ) : (
            <div className="grid gap-4">
              {orders.map((o) => (
                <Card key={o.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatPrice(Number(o.total))}</span>
                      <Badge className={cn(
                        o.status === 'delivered' && 'bg-success/15 text-success',
                        o.status === 'pending' && 'bg-warning/15 text-warning',
                        o.status === 'cancelled' && 'bg-destructive/15 text-destructive',
                        (o.status === 'processing' || o.status === 'shipped') && 'bg-primary/15 text-primary',
                      )}><span className="capitalize">{o.status}</span></Badge>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {(o.items as Array<{ name: string; quantity: number }>).map((item, i) => (
                      <p key={i}>{item.quantity}x {item.name}</p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          <h2 className="font-display text-xl font-semibold mb-4">Your Wishlist</h2>
          {dataLoading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : wishlist.length === 0 ? (
            <EmptyState icon={Heart} title="Your wishlist is empty" body="Save frames you love by tapping the heart icon." action={<Button asChild className="rounded-full"><Link href="/products">Browse Eyewear</Link></Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((w) => (
                <Card key={w.id} className="overflow-hidden">
                  <Link href={`/products/${w.product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
                    <Image src={w.product.images[0] ?? ''} alt={w.product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </Link>
                  <div className="p-4">
                    <p className="line-clamp-1 font-medium">{w.product.name}</p>
                    <p className="mt-1 font-semibold text-primary">{formatPrice(discountedPrice(w.product.price, w.product.discount_price), w.product.currency)}</p>
                    <div className="mt-3 flex gap-2">
                      <Button asChild size="sm" className="flex-1 rounded-full"><Link href={`/products/${w.product.slug}`}>View</Link></Button>
                      <Button size="sm" variant="outline" onClick={() => removeWish(w.id)} className="rounded-full"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Your Prescriptions</h2>
            <label>
              <Button className="rounded-full cursor-pointer" asChild>
                <span><Upload className="mr-2 h-4 w-4" /> Upload</span>
              </Button>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadRx(e.target.files[0])} />
            </label>
          </div>
          {dataLoading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : prescriptions.length === 0 ? (
            <EmptyState icon={FileText} title="No prescriptions uploaded" body="Upload your previous prescription for our doctors to review." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {prescriptions.map((rx) => (
                <Card key={rx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">{rx.file_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(rx.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={rx.reviewed ? 'secondary' : 'outline'} className={cn(rx.reviewed && 'text-success')}>
                    {rx.reviewed ? 'Reviewed' : 'Pending'}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="max-w-lg p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email ?? ''} disabled />
              </div>
              <div className="flex gap-3 pt-2">
                {editing ? (
                  <>
                    <Button onClick={saveProfile} className="rounded-full">Save Changes</Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setName(profile?.full_name ?? ''); setPhone(profile?.phone ?? ''); }} className="rounded-full">Cancel</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setEditing(true)} className="rounded-full">Edit Profile</Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: 'Pending', cls: 'bg-warning/15 text-warning', icon: Clock },
    confirmed: { label: 'Confirmed', cls: 'bg-primary/15 text-primary', icon: CheckCircle2 },
    completed: { label: 'Completed', cls: 'bg-success/15 text-success', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', cls: 'bg-destructive/15 text-destructive', icon: XCircle },
  };
  const s = map[status] ?? map.pending;
  const Icon = s.icon;
  return <Badge className={s.cls}><Icon className="mr-1 h-3 w-3" /> {s.label}</Badge>;
}

function EmptyState({ icon: Icon, title, body, action }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
