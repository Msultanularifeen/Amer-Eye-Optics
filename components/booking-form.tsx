'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft,
  Loader2, Upload, X,
} from 'lucide-react';
import { supabase, type Service, type Doctor, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function generateSlots(workStart: string, workEnd: string, durationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = workStart.split(':').map(Number);
  const [eh, em] = workEnd.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current + durationMins <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`);
    current += durationMins;
  }
  return slots;
}

export function BookingForm({ services, doctors: initialDoctors }: { services: Service[]; doctors: Doctor[] }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [form, setForm] = useState({
    patient_name: '', phone: '', email: '', age: '', gender: '', reason: '',
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);

  const service = services.find((s) => s.id === selectedService);
  const doctor = doctors.find((d) => d.id === selectedDoctor);

  useEffect(() => {
    if (user && profile) {
      setForm((p) => ({
        ...p,
        patient_name: profile.full_name || p.patient_name,
        phone: profile.phone || p.phone,
        email: user.email || p.email,
      }));
    }
  }, [user, profile]);

  // Load doctors for selected service
  useEffect(() => {
    if (!selectedService) return;
    setDoctorsLoading(true);
    setSelectedDoctor('');
    (async () => {
      const { data } = await supabase
        .from('doctor_services')
        .select('doctor:doctors(*)')
        .eq('service_id', selectedService);
      const docs = ((data ?? []) as unknown as { doctor: Doctor }[]).map((r) => r.doctor);
      setDoctors(docs.length > 0 ? docs : initialDoctors);
      setDoctorsLoading(false);
    })();
  }, [selectedService, initialDoctors]);

  // Load taken slots when date+doctor change
  useEffect(() => {
    if (!date || !selectedDoctor) return;
    (async () => {
      const { data } = await supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', selectedDoctor)
        .eq('date', date)
        .neq('status', 'cancelled');
      setTakenSlots((data ?? []).map((r) => (r as { time: string }).time));
    })();
  }, [date, selectedDoctor]);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const dayName = date ? DAYS[new Date(date).getDay()] : '';
  const doctorOff = doctor ? doctor.off_days.includes(dayName) || !doctor.available_days.includes(dayName) : false;
  const allSlots = doctor ? generateSlots(doctor.work_start, doctor.work_end, doctor.slot_duration_mins) : [];

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleFile = async (file: File) => {
    setPrescriptionFile(file);
    if (user) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('prescriptions').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('prescriptions').getPublicUrl(path);
        setPrescriptionUrl(data.publicUrl);
      }
    }
  };

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedDoctor;
    if (step === 2) return !!date && !!time && !doctorOff;
    if (step === 3) return form.patient_name && form.phone;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    const payload: Omit<Appointment, 'id' | 'created_at'> = {
      user_id: user?.id ?? null,
      patient_name: form.patient_name,
      phone: form.phone,
      email: form.email,
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      reason: form.reason || null,
      service_id: selectedService,
      doctor_id: selectedDoctor,
      date,
      time,
      status: 'pending',
      prescription_url: prescriptionUrl,
      notes: null,
    };
    const { error } = await supabase.from('appointments').insert(payload);
    setLoading(false);
    if (error) { toast.error('Could not book appointment. Please try again.'); return; }
    toast.success('Appointment booked successfully!');
    setStep(4);
    setTimeout(() => { if (user) router.push('/dashboard?tab=appointments'); }, 2500);
  };

  const steps = ['Service', 'Doctor', 'Date & Time', 'Your Details', 'Confirm'];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition',
              i < step ? 'bg-success text-success-foreground' :
              i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-sm hidden sm:block', i === step ? 'font-medium text-foreground' : 'text-muted-foreground')}>{label}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep(1); }}
                  className={cn(
                    'text-left rounded-2xl border-2 p-5 transition',
                    selectedService === s.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <h3 className="font-display font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-primary">{formatPrice(Number(s.price))}</span>
                    <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{s.duration_mins}m</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            doctorsLoading ? (
              <div className="grid place-items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No doctors available for this service yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoctor(d.id)}
                    className={cn(
                      'text-left rounded-2xl border-2 p-5 transition',
                      selectedDoctor === d.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <h3 className="font-display font-semibold">{d.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{d.specialization}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{d.experience_years} years experience</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.available_days.map((day) => (
                        <Badge key={day} variant="secondary" className="text-[11px]">{day.slice(0, 3)}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {d.work_start}–{d.work_end} · {d.slot_duration_mins}min slots
                    </p>
                  </button>
                ))}
              </div>
            )
          )}

          {step === 2 && (
            <Card className="max-w-2xl p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input type="date" min={today} max={maxDate} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} />
                  {date && doctorOff && (
                    <p className="text-sm text-warning">
                      {doctor?.name} is not available on {dayName}. Please choose another date.
                    </p>
                  )}
                </div>
                {date && !doctorOff && (
                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    {allSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No slots configured for this doctor.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {allSlots.map((slot) => {
                          const taken = takenSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              disabled={taken}
                              onClick={() => setTime(slot)}
                              className={cn(
                                'rounded-lg border px-3 py-2 text-sm transition',
                                taken ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through' :
                                time === slot ? 'border-primary bg-primary text-primary-foreground' :
                                'border-border hover:border-primary/40'
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Greyed-out times are already booked. Slots are {doctor?.slot_duration_mins} minutes each.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="max-w-2xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Patient Name *</Label>
                  <Input value={form.patient_name} onChange={(e) => update('patient_name', e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 1234567" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="e.g. 32" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Reason for visit (optional)</Label>
                  <Textarea value={form.reason} onChange={(e) => update('reason', e.target.value)} placeholder="Briefly describe your symptoms or reason..." rows={3} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Upload previous prescription (optional)</Label>
                  <div className="rounded-xl border-2 border-dashed border-border p-4">
                    {prescriptionFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{prescriptionFile.name}</span>
                        <button onClick={() => { setPrescriptionFile(null); setPrescriptionUrl(null); }} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-6 w-6" />
                        <span>Click to upload (image or PDF)</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="max-w-2xl p-8 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Appointment Confirmed!</h2>
              <p className="mt-2 text-muted-foreground">We&apos;ve received your booking. Our team will confirm shortly.</p>
              <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-border/60 bg-card/60 p-5 text-left text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{service?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span className="font-medium">{doctor?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{date}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{form.patient_name}</span></div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Redirecting to your dashboard...</p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 4 && (
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="rounded-full">
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={loading || !canNext()} className="rounded-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
