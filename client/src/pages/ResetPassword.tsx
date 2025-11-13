import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'wouter';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [linkInfo, setLinkInfo] = useState('');

  // Establish a session from tokens in URL (Supabase sends access_token & refresh_token in hash for recovery)
  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);
        const getParam = (k: string) => hashParams.get(k) ?? searchParams.get(k);
        const errCode = getParam('error_code');
        const errDesc = getParam('error_description') || getParam('error');
        const type = getParam('type');
        if (type) setLinkInfo(type);

        if (errCode || errDesc) {
          if (errCode === 'otp_expired') {
            setError('Link reset sudah kadaluarsa. Minta email reset baru.');
          } else if (errCode === 'access_denied') {
            setError('Access denied. Link mungkin sudah dipakai atau tidak valid.');
          } else {
            setError(errDesc || 'Link reset tidak valid.');
          }
          setSessionChecked(true);
          return;
        }

        const access_token = getParam('access_token');
        const refresh_token = getParam('refresh_token');
        if (access_token && refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
          if (setErr) {
            setError(setErr.message);
            setSessionChecked(true);
            return;
          }
        }

        await supabase.auth.getSession();
        setSessionChecked(true);
      } catch (e: any) {
        setError(e.message || String(e));
        setSessionChecked(true);
      }
    })();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (password !== confirm) { setError('Password tidak cocok'); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-full p-4'>
      <Card className='w-96 max-w-full'>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <>
              <Alert variant='destructive' className='mb-4'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className='text-sm mb-4'>
                <span className='text-muted-foreground'>Butuh link baru?</span>{' '}
                <Link href='/forgot-password' className='text-primary hover:underline'>Kirim ulang email reset</Link>
              </div>
            </>
          )}
          {!error && linkInfo && (
            <p className='text-xs text-muted-foreground mb-2'>Tipe link: {linkInfo}</p>
          )}
          {!sessionChecked ? (
            <p className='text-sm text-muted-foreground'>Menyiapkan sesi…</p>
          ) : done ? (
            <p className='text-sm text-muted-foreground'>Password berhasil diubah. Silakan kembali ke halaman login.</p>
          ) : (
            <form onSubmit={handleReset} className='space-y-3'>
              <div>
                <label className='text-sm mb-1 block text-muted-foreground'>Password Baru</label>
                <Input type='password' value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className='text-sm mb-1 block text-muted-foreground'>Konfirmasi Password</label>
                <Input type='password' value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <CardFooter className='pt-0'>
                <Button type='submit' className='w-full' disabled={loading}>{loading ? 'Menyimpan…' : 'Reset password'}</Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}