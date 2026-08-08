'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Shield, UserCog, Stethoscope, ShoppingBag, User, Search } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'customer', label: 'Customer', icon: User, color: 'text-muted-foreground' },
  { value: 'owner', label: 'Owner (Full Admin)', icon: Shield, color: 'text-primary' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-accent' },
  { value: 'receptionist', label: 'Receptionist', icon: UserCog, color: 'text-primary' },
  { value: 'sales', label: 'Sales Staff', icon: ShoppingBag, color: 'text-accent' },
];

type ProfileWithEmail = Profile & { email?: string };

export function AdminStaff() {
  const { profile } = useAuth();
  const [staff, setStaff] = useState<ProfileWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isOwner = profile?.role === 'owner';

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    // Fetch emails from auth via a join-like approach: we can't query auth.users directly,
    // so we use the user metadata if available. The profile doesn't store email, but we
    // can show the role and name. For the admin's own account we know the email.
    setStaff((data ?? []) as ProfileWithEmail[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, role: string) => {
    if (!isOwner) { toast.error('Only the owner can change roles'); return; }
    if (id === profile?.id) { toast.error("You can't change your own role"); return; }
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setStaff((s) => s.map((p) => (p.id === id ? { ...p, role: role as Profile['role'] } : p)));
    toast.success('Role updated');
  };

  const filtered = staff.filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.full_name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q);
  });

  const roleInfo = (role: string) => ROLES.find((r) => r.value === role) ?? ROLES[0];

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Staff & Users</h1>
        <p className="text-sm text-muted-foreground">
          {isOwner ? 'Manage all users and assign roles. Only you (owner) can change roles.' : 'View all registered users. Ask the owner to change roles.'}
        </p>
      </div>

      {/* Online/role summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.filter((r) => r.value !== 'customer').map((r) => {
          const count = staff.filter((s) => s.role === r.value).length;
          return (
            <Card key={r.value} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-muted', r.color)}>
                  <r.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">{count}</p>
                  <p className="text-xs text-muted-foreground">{r.label.split(' (')[0]}</p>
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">{staff.filter((s) => s.role === 'customer').length}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or role..." className="pl-9 rounded-full" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/40">
              <tr className="text-left">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ri = roleInfo(p.role);
                const isSelf = p.id === profile?.id;
                return (
                  <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-primary-foreground text-sm">
                          {p.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{p.full_name} {isSelf && <span className="text-xs text-muted-foreground">(You)</span>}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.phone || '—'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn('gap-1', ri.color)}>
                        <ri.icon className="h-3 w-3" /> {ri.label.split(' (')[0]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        {isOwner ? (
                          <Select value={p.role} onValueChange={(v) => changeRole(p.id, v)} disabled={isSelf}>
                            <SelectTrigger className="w-[160px] rounded-full h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-muted-foreground">Owner only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {!isOwner && (
        <Card className="border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-sm">Role permissions</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li><strong>Owner:</strong> Full access — all settings, roles, products, appointments, orders</li>
                <li><strong>Doctor:</strong> Can view appointments and patient info</li>
                <li><strong>Receptionist:</strong> Can manage appointments and orders</li>
                <li><strong>Sales:</strong> Can manage products and orders</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
