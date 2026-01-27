'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { FullPageLoader } from '@/components/ui/Loading';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirect || '/');
    }
  }, [user, authLoading, redirect, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--primary)] mb-2">SIP</h1>
          <p className="text-[var(--text-secondary)]">Student Internship Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6">Welcome Back</h2>
          
          {generalError && (
            <Alert variant="error" className="mb-4">
              {generalError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="you@example.com"
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              placeholder="••••••••"
              disabled={loading}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="ml-2 text-[var(--text-secondary)]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Test Accounts Info */}
          <Alert variant="info" className="mt-6">
            <p className="text-sm font-medium mb-2">Test Accounts:</p>
            <div className="text-xs space-y-1">
              <p>👨‍💼 Admin: admin@sip.com / Admin@123</p>
              <p>🏢 Employer: employer@example.com / Employer@123</p>
              <p>🎓 Student: student@example.com / Student@123</p>
            </div>
          </Alert>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--text-secondary)]">Don't have an account? </span>
            <Link href="/auth/register" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-secondary)] mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
