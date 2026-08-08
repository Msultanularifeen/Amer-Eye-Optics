'use client';

import { useEffect, useState } from 'react';
import { Check, X, Clock, Loader2, CalendarDays, Filter } from 'lucide-react';
import { supabase, type Appointment } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth';

export function AdminAppointments() {
  const { profile } = useAuth();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // If logged-in user is a doctor, find their doctor record to filter appointments
  useEffect(() => {
    if (profile?.role === 'doctor' && profile.full_name) {
      (async () => {
        const { data } = await supabase.from('doctors').select('id').ilike('name', `%${profile.full_name}%`).maybeSingle();
        if (data) setDoctorId(data.id);
      })();
    }
  }, [profile]);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('appointments').select('*').order('date', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    if (doctorId) q = q.eq('doctor_id', doctorId);
    const { data } = await q;
    setAppts((data ?? []) as Appointment[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, doctorId]);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAppts((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Appointment ${status}`);
  };

  const statusCls: Record<string, string> = {
    pending: 'bg-warning/15 text-warning',
    confirmed: 'bg-primary/15 text-primary',
    completed: 'bg-success/15 text-success',
    cancelled: 'bg-destructive/15 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Appointment Management</h1>
          <p className="text-sm text-muted-foreground">{appts.length} appointments</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] rounded-full"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : appts.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No appointments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appts.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.patient_name}</p>
                      <Badge className={statusCls[a.status]}><span className="capitalize">{a.status}</span></Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.date} · {a.time} {a.reason ? `· ${a.reason}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.phone} {a.email ? `· ${a.email}` : ''}{a.age ? ` · Age ${a.age}` : ''}</p>
                    {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notes: {a.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(a.id, 'confirmed')} className="rounded-full bg-success text-success-foreground hover:bg-success/90">
                        <Check className="mr-1 h-4 w-4" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'cancelled')} className="rounded-full text-destructive">
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <Button size="sm" onClick={() => updateStatus(a.id, 'completed')} className="rounded-full">
                      <Check className="mr-1 h-4 w-4" /> Mark Done
                    </Button>
                  )}
                  {(a.status === 'confirmed' || a.status === 'pending') && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, 'cancelled')} className="rounded-full">Cancel</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
