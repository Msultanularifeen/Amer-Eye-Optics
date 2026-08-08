'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Phone, Mail } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AdminPatients() {
  const [patients, setPatients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setPatients((data ?? []) as Profile[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Patient Management</h1>
        <p className="text-sm text-muted-foreground">{patients.length} registered patients</p>
      </div>
      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : patients.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No patients registered yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-primary-foreground">
                  {p.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.full_name}</p>
                  <Badge variant="secondary" className="capitalize text-[11px] mt-0.5">{p.role}</Badge>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {p.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {p.phone}</p>}
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> Joined {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
