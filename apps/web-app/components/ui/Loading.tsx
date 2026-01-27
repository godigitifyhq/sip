export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-[var(--primary)] border-t-transparent ${sizeClasses[size]}`}></div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
