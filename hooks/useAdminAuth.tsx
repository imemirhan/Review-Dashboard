'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('adminAuth');
    const session = raw ? JSON.parse(raw) : null;

    if (!session || Date.now() > session.expires) {
      localStorage.removeItem('adminAuth');
      router.push('/login');
    }
  }, [router]);
}
