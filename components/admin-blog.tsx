'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, FileText, X } from 'lucide-react';
import { supabase, type BlogPost } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';

const EMPTY: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', category: 'Eye Care Tips',
  image: '', author: 'Amir Optical',
};

const CATEGORIES = ['Eye Care Tips', 'Latest Fashion', 'Lens Guide', 'Health Articles', 'Operation Recovery', 'Children Eye Care'];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BlogPost>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    setPosts((data ?? []) as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p: BlogPost) => { setEditId(p.id); setForm(p); setOpen(true); };
  const set = (k: keyof BlogPost, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title || !form.excerpt || !form.content) { toast.error('Title, excerpt, and content are required'); return; }
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.title!) };
    if (editId) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Post updated');
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Post published');
    }
    setSaving(false); setOpen(false); load();
  };

  const del = async (p: BlogPost) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Post deleted'); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Blog Management</h1>
          <p className="text-sm text-muted-foreground">{posts.length} posts</p>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No posts yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.image && (
                <div className="relative aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <Badge variant="secondary" className="mb-2">{p.category}</Badge>
                <h3 className="font-display font-semibold line-clamp-2">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">By {p.author} · {new Date(p.published_at).toLocaleDateString()}</p>
                <div className="mt-3 flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="rounded-full"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => del(p)} className="rounded-full text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Post' : 'New Blog Post'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Author</Label><Input value={form.author ?? ''} onChange={(e) => set('author', e.target.value)} /></div>
            </div>
            <ImageUpload label="Blog Post Image" value={form.image ?? ''} onChange={(v) => set('image', v)} aspectRatio="16:9" folder="blog" />
            <div className="space-y-2"><Label>Excerpt *</Label><Textarea value={form.excerpt ?? ''} onChange={(e) => set('excerpt', e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Content *</Label><Textarea value={form.content ?? ''} onChange={(e) => set('content', e.target.value)} rows={8} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-full">{saving ? 'Saving...' : 'Save Post'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
