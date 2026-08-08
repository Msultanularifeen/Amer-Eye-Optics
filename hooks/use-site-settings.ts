'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FALLBACK, type SiteSettings } from '@/lib/settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setSettings(data as SiteSettings);
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
}
