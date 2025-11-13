import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Simple cooldown to mirror backend throttle (12s)
const COOLDOWN_MS = 12_000;

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('Kami mengirim link konfirmasi ke email kamu. Periksa inbox / spam lalu klik linknya.');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [nextAllowed, setNextAllowed] = useState<number>(0);

  // Try to pre-fill email from current auth user (if already logged in partially)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setEmail(data.user?.email || '');
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const resend = async () => {
    setError('');
    const now = Date.now();
    if (now < nextAllowed) {
      const wait = Math.ceil((nextAllowed - now) / 1000);
      setError(`Tunggu ${wait}s sebelum kirim ulang.`);
      return;
    }
    if (!email) {
      setError('Email tidak ditemukan. Buka halaman Sign Up / Login lagi.');
      return;
    }
    setSending(true);
    try {
      // Prefer backend resend endpoint (has throttle + redirect env)
      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Failed: ${resp.status}`);
      }
      setInfo('Email konfirmasi dikirim ulang. Periksa inbox / spam.');
      setNextAllowed(Date.now() + COOLDOWN_MS);
    } catch (e: any) {
      // Fallback to direct Supabase if backend fails
      try {
        const resendAny: any = (supabase.auth as any).resend;
        if (typeof resendAny === 'function') {
          const { error: se } = await resendAny({ type: 'signup', email });
          if (se) throw se;
          setInfo('Email konfirmasi (fallback) dikirim.');
          setNextAllowed(Date.now() + COOLDOWN_MS);
        } else {
          const { error: suErr } = await supabase.auth.signUp({ email, password: crypto.randomUUID() });
          if (suErr) throw suErr;
          setInfo('Flow signup ulang: email dikirim kembali.');
          setNextAllowed(Date.now() + COOLDOWN_MS);
        }
      } catch (inner: any) {
        setError(inner.message || e.message || String(e));
      }
    } finally {
      setSending(false);
    }
  };

  const remaining = nextAllowed > Date.now() ? Math.ceil((nextAllowed - Date.now()) / 1000) : 0;

  return (
    <div className='flex items-center justify-center h-full p-4'>
      <Card className='w-[28rem] max-w-full'>
        <CardHeader>
          <CardTitle>Konfirmasi Email</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className='text-sm text-muted-foreground mb-4'>{info}</p>
          <div className='flex gap-2'>
            <Button onClick={resend} disabled={sending || remaining > 0}>{sending ? 'Mengirim…' : remaining > 0 ? `Tunggu ${remaining}s` : 'Kirim ulang link'}</Button>
            <Button variant='outline' onClick={() => window.location.reload()}>Sudah klik link</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}