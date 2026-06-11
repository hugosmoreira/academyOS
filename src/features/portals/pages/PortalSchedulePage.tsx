import { CalendarDays } from 'lucide-react';
import { usePortalSummary } from '../hooks/usePortalSummary';

export default function PortalSchedulePage() {
  const summaryQuery = usePortalSummary();
  const students = summaryQuery.data?.linkedStudents ?? [];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3 text-primary" /> My Schedule
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Upcoming classes</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          The class slots you&apos;re enrolled in. Class details will appear here once your gym
          publishes the schedule.
        </p>
      </header>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          We don&apos;t have any students linked to your account yet.
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          Your schedule will appear here once class enrollments are wired in.
        </div>
      )}
    </div>
  );
}
