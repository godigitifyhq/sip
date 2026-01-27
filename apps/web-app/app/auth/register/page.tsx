'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { FullPageLoader } from '@/components/ui/Loading';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as 'STUDENT' | 'EMPLOYER',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register(formData.email, formData.password, formData.role);
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--primary)] mb-2">SIP</h1>
          <p className="text-[var(--text-secondary)]">Student Internship Portal</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6">Create Account</h2>
          
          {generalError && (
            <Alert variant="error" className="mb-4">
              {generalError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'STUDENT'
                      ? 'border-[var(--primary)] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="font-medium text-sm">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'EMPLOYER'
                      ? 'border-[var(--primary)] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="font-medium text-sm">Employer</div>
                </button>
              </div>
            </div>

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
              helperText="Min. 8 characters with uppercase, lowercase, and number"
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={loading}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-[var(--text-secondary)]">
                I agree to the <Link href="/terms" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--text-secondary)]">Already have an account? </span>
            <Link href="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-secondary)] mt-8">
          Protected by industry-standard encryption and security measures
        </p>
      </div>
    </div>
  );
}
