'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Glasses, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.04 12.26c0-.86-.08-1.69-.22-2.48H12v4.7h6.18a5.27 5.27 0 0 1-2.29 3.46v2.88h3.7c2.17-2 3.45-4.95 3.45-8.56Z" fill="#4285F4"/>
      <path d="M12 23.5c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.88c-1.03.69-2.35 1.1-4.23 1.1-3.26 0-6.02-2.2-7.01-5.17H1.04v2.97A11.5 11.5 0 0 0 12 23.5Z" fill="#34A853"/>
      <path d="M4.99 13.64a6.9 6.9 0 0 1 0-4.4V6.28H1.04a11.51 11.51 0 0 0 0 10.33l3.95-2.97Z" fill="#FBBC04"/>
      <path d="M12 4.73c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.5 11.5 0 0 0 1.04 6.28l3.95 2.97C5.98 6.93 8.74 4.73 12 4.73Z" fill="#EA4335"/>
    </svg>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) { toast.error(error); return; }
      toast.success('Welcome back!');
      router.push('/');
    } else {
      const { error } = await signUp(email, password, fullName, phone);
      setLoading(false);
      if (error) { toast.error(error); return; }
      toast.success('Account created! Welcome to Amir Optical.');
      router.push('/');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden bg-gradient-to-br from-primary to-accent p-12 lg:block">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="relative flex h-full flex-col justify-between text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <Glasses className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-semibold">Amir Optical</span>
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight">
              {mode === 'login' ? 'Welcome back to clearer vision' : 'Join the Amir Optical family'}
            </h1>
            <p className="mt-4 text-white/80 max-w-md">
              {mode === 'login'
                ? 'Sign in to manage your appointments, orders, prescriptions, and wishlist.'
                : 'Create an account to book appointments, track orders, save favorites, and upload prescriptions.'}
            </p>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} Amir Optical Center</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Glasses className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-semibold">Amir Optical</span>
          </div>

          <h2 className="font-display text-2xl font-semibold">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <a href={mode === 'login' ? '/signup' : '/login'} className="font-medium text-primary hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </a>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="pl-9" required />
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="pl-9" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            size="lg"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true);
              const { error } = await signInWithGoogle();
              if (error) { toast.error(error); setGoogleLoading(false); }
            }}
          >
            {googleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Staff members: use the same sign-in. Your role is detected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
