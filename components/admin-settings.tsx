'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Image as ImageIcon, Phone, MessageCircle, BarChart3, Info, MapPin, Code2, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/settings';
import { FALLBACK } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function AdminSettings() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'owner')) {
      toast.error('Only the owner can edit site settings');
      router.push('/admin');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setSettings(data as SiteSettings);
      setLoading(false);
    })();
  }, []);

  const set = (k: keyof SiteSettings, v: string | number) => setSettings((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_image: settings.hero_image,
      hero_badge: settings.hero_badge,
      stat_customers: Number(settings.stat_customers),
      stat_years: Number(settings.stat_years),
      stat_frames: Number(settings.stat_frames),
      stat_happy: Number(settings.stat_happy),
      about_title: settings.about_title,
      about_subtitle: settings.about_subtitle,
      about_image: settings.about_image,
      about_mission: settings.about_mission,
      about_vision: settings.about_vision,
      contact_phone: settings.contact_phone,
      contact_phone_alt: settings.contact_phone_alt,
      contact_email: settings.contact_email,
      contact_email_alt: settings.contact_email_alt,
      contact_address: settings.contact_address,
      contact_map_lat: Number(settings.contact_map_lat),
      contact_map_lng: Number(settings.contact_map_lng),
      business_hours: settings.business_hours,
      whatsapp_number: settings.whatsapp_number,
      developer_name: settings.developer_name,
      developer_photo: settings.developer_photo,
      developer_whatsapp: settings.developer_whatsapp,
      developer_bio: settings.developer_bio,
      developer_title: settings.developer_title,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      site_name: settings.site_name,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Site settings saved! Changes are live.');
  };

  if (loading || !profile || profile.role !== 'owner') {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Site Settings</h1>
          <p className="text-sm text-muted-foreground">Edit all website content, images, branding, and contact info.</p>
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
          <TabsTrigger value="branding" className="rounded-lg"><Palette className="mr-1.5 h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="hero" className="rounded-lg"><ImageIcon className="mr-1.5 h-4 w-4" /> Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg"><Info className="mr-1.5 h-4 w-4" /> About</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg"><BarChart3 className="mr-1.5 h-4 w-4" /> Stats</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg"><Phone className="mr-1.5 h-4 w-4" /> Contact & Map</TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-lg"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="developer" className="rounded-lg"><Code2 className="mr-1.5 h-4 w-4" /> Developer</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input value={settings.site_name} onChange={(e) => set('site_name', e.target.value)} />
              <p className="text-xs text-muted-foreground">Shown in navbar, footer, browser tab title, and sitemap.</p>
            </div>
            <ImageUpload label="Logo (shown in navbar & footer)" value={settings.logo_url} onChange={(v) => set('logo_url', v)} aspectRatio="1:1" folder="branding" />
            <ImageUpload label="Favicon (browser tab icon)" value={settings.favicon_url} onChange={(v) => set('favicon_url', v)} aspectRatio="1:1" folder="branding" />
          </Card>
        </TabsContent>

        {/* Hero */}
        <TabsContent value="hero" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Badge Text</Label>
              <Input value={settings.hero_badge} onChange={(e) => set('hero_badge', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Title</Label>
              <Input value={settings.hero_title} onChange={(e) => set('hero_title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hero Subtitle</Label>
              <Textarea value={settings.hero_subtitle} onChange={(e) => set('hero_subtitle', e.target.value)} rows={2} />
            </div>
            <ImageUpload label="Hero Image" value={settings.hero_image} onChange={(v) => set('hero_image', v)} aspectRatio="1:1" folder="hero" />
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2"><Label>About Title</Label><Input value={settings.about_title} onChange={(e) => set('about_title', e.target.value)} /></div>
            <div className="space-y-2"><Label>About Subtitle</Label><Textarea value={settings.about_subtitle} onChange={(e) => set('about_subtitle', e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Mission</Label><Textarea value={settings.about_mission} onChange={(e) => set('about_mission', e.target.value)} rows={3} /></div>
            <div className="space-y-2"><Label>Vision</Label><Textarea value={settings.about_vision} onChange={(e) => set('about_vision', e.target.value)} rows={3} /></div>
            <ImageUpload label="About Image" value={settings.about_image} onChange={(v) => set('about_image', v)} aspectRatio="4:3" folder="about" />
          </Card>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Customers Served</Label><Input type="number" value={settings.stat_customers} onChange={(e) => set('stat_customers', e.target.value)} /></div>
              <div className="space-y-2"><Label>Years of Experience</Label><Input type="number" value={settings.stat_years} onChange={(e) => set('stat_years', e.target.value)} /></div>
              <div className="space-y-2"><Label>Frames Available</Label><Input type="number" value={settings.stat_frames} onChange={(e) => set('stat_frames', e.target.value)} /></div>
              <div className="space-y-2"><Label>Happy Customers (%)</Label><Input type="number" value={settings.stat_happy} onChange={(e) => set('stat_happy', e.target.value)} /></div>
            </div>
          </Card>
        </TabsContent>

        {/* Contact & Map */}
        <TabsContent value="contact" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={settings.contact_address} onChange={(e) => set('contact_address', e.target.value)} rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Primary Phone</Label><Input value={settings.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>Alternate Phone</Label><Input value={settings.contact_phone_alt} onChange={(e) => set('contact_phone_alt', e.target.value)} /></div>
              <div className="space-y-2"><Label>Primary Email</Label><Input value={settings.contact_email} onChange={(e) => set('contact_email', e.target.value)} /></div>
              <div className="space-y-2"><Label>Alternate Email</Label><Input value={settings.contact_email_alt} onChange={(e) => set('contact_email_alt', e.target.value)} /></div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Live Map Location</span></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="0.0001" value={settings.contact_map_lat} onChange={(e) => set('contact_map_lat', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="0.0001" value={settings.contact_map_lng} onChange={(e) => set('contact_map_lng', e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Find your coordinates: right-click your location on Google Maps → the coordinates appear. Enter them here to update the map.</p>
            </div>
            <div className="space-y-2">
              <Label>Business Hours</Label>
              <Textarea value={settings.business_hours} onChange={(e) => set('business_hours', e.target.value)} rows={2} />
            </div>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={settings.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="923001234567" />
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3 text-success" />Country code, no + or spaces. e.g. 923001234567</p>
            </div>
          </Card>
        </TabsContent>

        {/* Developer */}
        <TabsContent value="developer" className="mt-6">
          <Card className="max-w-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Developer Name</Label>
              <Input value={settings.developer_name} onChange={(e) => set('developer_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Developer Title / Role</Label>
              <Input value={settings.developer_title} onChange={(e) => set('developer_title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Developer Bio</Label>
              <Textarea value={settings.developer_bio} onChange={(e) => set('developer_bio', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Developer WhatsApp Number</Label>
              <Input value={settings.developer_whatsapp} onChange={(e) => set('developer_whatsapp', e.target.value)} placeholder="923001234567" />
              <p className="text-xs text-muted-foreground">If filled, a &quot;Need a website? Contact&quot; button links to this WhatsApp number on every page and in the popup.</p>
            </div>
            <ImageUpload label="Developer Photo" value={settings.developer_photo} onChange={(v) => set('developer_photo', v)} aspectRatio="1:1" folder="developer" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
