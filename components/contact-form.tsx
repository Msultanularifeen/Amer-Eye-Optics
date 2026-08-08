'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in your name, email, and message');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject || 'General enquiry',
      message: form.message,
    });
    setLoading(false);
    if (error) {
      toast.error('Something went wrong. Please try again.');
      return;
    }
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 1234567" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="What is this about?" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Tell us how we can help..." rows={5} required />
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
