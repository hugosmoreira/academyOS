export default function LoadingScreen({ message = 'Loading AcademyOS...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low px-6 py-5 text-sm text-on-surface-variant">
        {message}
      </div>
    </div>
  );
}
