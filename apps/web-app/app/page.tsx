'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FullPageLoader } from '@/components/ui/Loading';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        // Redirect based on role
        if (user.role === 'STUDENT') {
          router.push('/student/dashboard');
        } else if (user.role === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, loading, router]);

  return <FullPageLoader />;
}
