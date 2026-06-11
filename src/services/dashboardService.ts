import { supabase } from '../lib/supabase';

export type DashboardMetrics = {
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  /** null = the backing table/column is not provisioned yet (render an em dash). */
  totalPrograms: number | null;
  totalClassTemplates: number | null;
  totalAttendanceRecords: number | null;
};

/** Missing table (PGRST205/42P01) or missing column (PGRST204/42703). */
function isMissingSchemaError(error: { code?: string; message?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST205' ||
    error.code === 'PGRST204' ||
    error.code === '42P01' ||
    error.code === '42703' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

type QueryModifier = (q: ReturnType<ReturnType<typeof supabase.from>['select']>) => typeof q;

async function safeCount(table: string, modifier?: QueryModifier): Promise<number> {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  if (modifier) query = modifier(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Like safeCount, but a missing table/column resolves to null instead of
 * killing the whole dashboard. Real errors (RLS, network) still throw.
 */
async function tolerantCount(table: string, modifier?: QueryModifier): Promise<number | null> {
  try {
    return await safeCount(table, modifier);
  } catch (error) {
    if (error && isMissingSchemaError(error as { code?: string; message?: string })) {
      console.warn(`[AcademyOS] Dashboard metric skipped: ${table} is not provisioned yet.`, error);
      return null;
    }
    throw error;
  }
}

export async function getDashboardMetrics(gymId?: string): Promise<DashboardMetrics> {
  if (!gymId) {
    throw new Error('gymId is required for dashboard metrics');
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const gymFilter: QueryModifier = (q) => q.eq('gym_id', gymId);

  const [
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    totalPrograms,
    totalClassTemplates,
    totalAttendanceRecords,
  ] = await Promise.all([
    safeCount('students', gymFilter),
    safeCount('students', (q) => gymFilter(q).eq('status', 'active')),
    safeCount('students', (q) =>
      gymFilter(q).gte('created_at', startOfMonth.toISOString()),
    ),
    tolerantCount('programs', gymFilter),
    tolerantCount('class_templates', gymFilter),
    tolerantCount('attendance_records', gymFilter),
  ]);

  return {
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    totalPrograms,
    totalClassTemplates,
    totalAttendanceRecords,
  };
}
