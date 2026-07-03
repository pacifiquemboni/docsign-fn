import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageSpinner } from '@/components/common/LoadingSpinner';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      navigate(params.get('next') ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
          <PenLine className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">DocSign</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <Outlet />
      </div>

      <p className="mt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} DocSign — Electronic Signatures
      </p>
    </div>
  );
}
