'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export function AuthInit() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
