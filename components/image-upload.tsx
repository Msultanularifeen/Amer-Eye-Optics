'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, X, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  label?: string;
  bucket?: string;
  folder?: string;
};

export function ImageUpload({
  value,
  onChange,
  aspectRatio = '4:3',
  label = 'Image',
  bucket = 'images',
  folder = 'uploads',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setLoading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      contentType: file.type,
    });
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setLoading(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    onChange(data.publicUrl);
    setLoading(false);
    toast.success('Image uploaded');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrl(false);
      toast.success('Image URL set');
    }
  };

  const aspectClass: Record<string, string> = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '4:5': 'aspect-[4/5]',
    '3:4': 'aspect-[3/4]',
    '2:1': 'aspect-[2/1]',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">Suggested: {aspectRatio}</span>
      </div>

      {value ? (
        <div className={cn('relative group overflow-hidden rounded-lg border', aspectClass[aspectRatio] ?? 'aspect-[4/3]')}>
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={loading}>
              <Upload className="mr-1 h-3.5 w-3.5" /> Replace
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onChange('')}>
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn('flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition hover:border-primary/40', aspectClass[aspectRatio] ?? 'aspect-[4/3]')}
          onClick={() => fileRef.current?.click()}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground/70">PNG, JPG, WebP up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFile} />

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading} className="rounded-full">
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrl((v) => !v)} className="rounded-full">
          <LinkIcon className="mr-1.5 h-3.5 w-3.5" /> URL
        </Button>
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          />
          <Button type="button" size="sm" onClick={addUrl}>Set</Button>
        </div>
      )}
    </div>
  );
}
