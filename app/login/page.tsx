'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/dashboard/calendar');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Greška pri prijavi.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">TV Kalendar</h1>
        <p className="text-sm text-gray-500 mb-6">Prijavite se na vaš nalog</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" required autoComplete="email" />
          <Input label="Lozinka" name="password" type="password" required autoComplete="current-password" />

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <Button type="submit" loading={loading} fullWidth>
            Prijavi se
          </Button>
        </form>
      </div>
    </main>
  );
}
