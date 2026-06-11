import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, QrCode, Search, Swords } from 'lucide-react';
import { getGymBySlugOrId } from '../../../services/gymService';
import { listStudents } from '../../../services/studentService';

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '??';
}

export default function KioskScreen() {
  const { gymIdOrSlug } = useParams<{ gymIdOrSlug: string }>();
  const [search, setSearch] = useState('');

  const gymQuery = useQuery({
    queryKey: ['kiosk', 'gym', gymIdOrSlug ?? 'none'],
    queryFn: () => getGymBySlugOrId(gymIdOrSlug!),
    enabled: Boolean(gymIdOrSlug),
  });

  const gym = gymQuery.data;

  const studentsQuery = useQuery({
    queryKey: ['kiosk', 'students', gym?.id, search],
    queryFn: () =>
      listStudents({
        gymId: gym!.id,
        search: search.trim() || undefined,
        limit: 20,
      }),
    enabled: Boolean(gym?.id),
  });

  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col items-center px-8 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary-container border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Swords className="w-7 h-7 text-on-primary-container" />
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Check-In Kiosk</h1>
          {gymQuery.isLoading && (
            <p className="text-sm text-on-surface-variant">Loading gym...</p>
          )}
          {gym && (
            <p className="text-sm text-on-surface-variant">{gym.name}</p>
          )}
          {!gymQuery.isLoading && gymQuery.isError && (
            <p className="text-sm text-red-300">Unable to load gym. Check the kiosk URL.</p>
          )}
          {!gymQuery.isLoading && !gymQuery.isError && !gym && (
            <p className="text-sm text-on-surface-variant">Gym not found.</p>
          )}
        </div>

        {gym && (
          <>
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students by name..."
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl pl-11 pr-4 py-3 text-base text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            {studentsQuery.isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant py-12">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading students...
              </div>
            )}

            {studentsQuery.isError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center">
                Unable to load students for this gym.
              </div>
            )}

            {!studentsQuery.isLoading && !studentsQuery.isError && students.length === 0 && (
              <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
                {search.trim() ? 'No students match your search.' : 'No students yet.'}
              </div>
            )}

            {students.length > 0 && (
              <ul className="space-y-2 mb-6">
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-surface-container-high bg-surface-container-low"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
                      {getInitials(student.first_name, student.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-on-surface truncate">
                        {student.first_name} {student.last_name}
                      </div>
                      {student.belt && (
                        <div className="text-xs text-on-surface-variant">{student.belt}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col items-center gap-3 text-center">
              <QrCode className="w-10 h-10 text-on-surface-variant" />
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                Select a student to check in (coming soon)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
