import { Award, Sparkles } from 'lucide-react';
import { usePortalSummary } from '../hooks/usePortalSummary';

const BELT_COLORS: Record<string, string> = {
  White: 'border-on-surface text-on-surface',
  Blue: 'border-[#2196F3] text-[#2196F3]',
  Purple: 'border-[#9C27B0] text-[#9C27B0]',
  Brown: 'border-[#8B5A2B] text-[#8B5A2B]',
  Black: 'border-on-surface text-on-surface',
};

export default function PortalProgressPage() {
  const summaryQuery = usePortalSummary();
  const students = summaryQuery.data?.linkedStudents ?? [];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[900px] w-full mx-auto">
      <header className="border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" /> My Progress
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Belt &amp; ranks</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Track your current rank and stripes across each linked student profile.
        </p>
      </header>

      {summaryQuery.isLoading ? (
        <div className="text-sm text-on-surface-variant">Loading...</div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
          No linked student records yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => {
            const beltClass = BELT_COLORS[student.belt ?? 'White'] ?? BELT_COLORS.White;
            return (
              <div
                key={student.id}
                className="rounded-xl border border-surface-container-high bg-surface-container-low p-6"
              >
                <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-primary" /> {student.first_name} {student.last_name}
                </div>
                <div className={`text-2xl font-display font-bold border ${beltClass} rounded-md inline-flex items-center px-3 py-1 mb-3`}>
                  {student.belt ?? 'White'} Belt
                </div>
                <div className="text-sm text-on-surface-variant">
                  {student.stripes ?? 0} stripes
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
