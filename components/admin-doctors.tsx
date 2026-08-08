'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Stethoscope, X } from 'lucide-react';
import { supabase, type Doctor } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY: Partial<Doctor> = {
  name: '', qualification: '', experience_years: 0, specialization: '', bio: '',
  photo: '', available_days: ['Friday', 'Saturday', 'Sunday'], rating: 5, reviews_count: 0,
  work_start: '10:00', work_end: '19:00', slot_duration_mins: 30, off_days: [],
};

export function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Doctor>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Doctor | null>(null);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [assignedServices, setAssignedServices] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
    setDoctors((data ?? []) as Doctor[]);
    setLoading(false);
  };

  useEffect(() => { load(); (async () => {
    const { data } = await supabase.from('services').select('id, name').order('name');
    setServices((data ?? []) as { id: string; name: string }[]);
  })(); }, []);

  const loadServices = async (doctorId: string) => {
    const { data } = await supabase.from('doctor_services').select('service_id').eq('doctor_id', doctorId);
    setAssignedServices((data ?? []).map((r) => (r as { service_id: string }).service_id));
  };

  const openNew = () => { setEditId(null); setForm(EMPTY); setAssignedServices([]); setOpen(true); };
  const openEdit = async (d: Doctor) => {
    setEditId(d.id); setForm(d); setOpen(true);
    await loadServices(d.id);
  };
  const set = (k: keyof Doctor, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (day: string, field: 'available_days' | 'off_days') => {
    const days = form[field] ?? [];
    set(field, days.includes(day) ? days.filter((d) => d !== day) : [...days, day]);
  };

  const toggleService = (serviceId: string) => {
    setAssignedServices((prev) => prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]);
  };

  const save = async () => {
    if (!form.name || !form.qualification) { toast.error('Name and qualification are required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      experience_years: Number(form.experience_years ?? 0),
      rating: Number(form.rating ?? 5),
      reviews_count: Number(form.reviews_count ?? 0),
      available_days: form.available_days ?? [],
    };
    if (editId) {
      const { error } = await supabase.from('doctors').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      // Update service assignments
      await supabase.from('doctor_services').delete().eq('doctor_id', editId);
      if (assignedServices.length > 0) {
        await supabase.from('doctor_services').insert(assignedServices.map((sid) => ({ doctor_id: editId, service_id: sid })));
      }
      toast.success('Doctor updated');
    } else {
      const { data: newDoc, error } = await supabase.from('doctors').insert(payload).select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      if (assignedServices.length > 0) {
        await supabase.from('doctor_services').insert(assignedServices.map((sid) => ({ doctor_id: newDoc.id, service_id: sid })));
      }
      toast.success('Doctor added');
    }
    setSaving(false); setOpen(false); load();
  };

  const del = async (d: Doctor) => {
    const { error } = await supabase.from('doctors').delete().eq('id', d.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Doctor removed'); setConfirmDelete(null); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Doctor Management</h1>
          <p className="text-sm text-muted-foreground">{doctors.length} doctors</p>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Doctor</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : doctors.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No doctors yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {d.photo && <img src={d.photo} alt={d.name} className="h-full w-full object-cover" />}
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 text-destructive" onClick={() => setConfirmDelete(d)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold">{d.name}</h3>
                <p className="text-sm text-muted-foreground">{d.specialization}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.qualification}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={d.rating} size={13} />
                  <span className="text-xs text-muted-foreground">{d.reviews_count} reviews</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {d.available_days.map((day) => (
                    <Badge key={day} variant="secondary" className="text-[10px]">{day.slice(0, 3)}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Qualification *</Label><Input value={form.qualification ?? ''} onChange={(e) => set('qualification', e.target.value)} placeholder="FCPS Ophthalmology, MBBS" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={form.experience_years ?? 0} onChange={(e) => set('experience_years', e.target.value)} /></div>
              <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization ?? ''} onChange={(e) => set('specialization', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} rows={3} /></div>
            <ImageUpload label="Doctor Photo" value={form.photo ?? ''} onChange={(v) => set('photo', v)} aspectRatio="1:1" folder="doctors" />
            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day, 'available_days')}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      (form.available_days ?? []).includes(day) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40'
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rating (0-5)</Label><Input type="number" step="0.1" value={form.rating ?? 5} onChange={(e) => set('rating', e.target.value)} /></div>
              <div className="space-y-2"><Label>Reviews Count</Label><Input type="number" value={form.reviews_count ?? 0} onChange={(e) => set('reviews_count', e.target.value)} /></div>
            </div>

            {/* Schedule */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h4 className="text-sm font-semibold">Work Schedule</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Work Start</Label>
                  <Input type="time" value={form.work_start ?? '10:00'} onChange={(e) => set('work_start', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Work End</Label>
                  <Input type="time" value={form.work_end ?? '19:00'} onChange={(e) => set('work_end', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Slot Duration (min)</Label>
                  <Input type="number" value={form.slot_duration_mins ?? 30} onChange={(e) => set('slot_duration_mins', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day, 'available_days')}
                      className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition',
                        (form.available_days ?? []).includes(day) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40')}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Off Days (never available)</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day, 'off_days')}
                      className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition',
                        (form.off_days ?? []).includes(day) ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border hover:border-destructive/40')}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-sm font-semibold">Services Offered</h4>
              <p className="text-xs text-muted-foreground">Select which services this doctor provides. Only selected services will show this doctor during booking.</p>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                    className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      assignedServices.includes(s.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40')}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">{saving ? 'Saving...' : 'Save Doctor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove doctor?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Remove <strong>{confirmDelete?.name}</strong> from the team? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="rounded-full">Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && del(confirmDelete)} className="rounded-full">Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
