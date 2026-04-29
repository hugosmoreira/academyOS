import { supabase } from '../lib/supabase';

export type DashboardMetrics = {
  totalOrganizations: number;
  totalGyms: number;
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  totalPrograms: number;
  totalClassTemplates: number;
  totalAttendanceRecords: number;
};

async function safeCount(table: string, modifier?: (q: any) => any): Promise<number> {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  if (modifier) query = modifier(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/** Like safeCount but returns 0 on error instead of throwing */
async function resilientCount(table: string, modifier?: (q: any) => any): Promise<number> {
  try {
    return await safeCount(table, modifier);
  } catch {
    return 0;
  }
}

export async function getDashboardMetrics(organizationId?: string): Promise<DashboardMetrics> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const orgFilter = (q: any) => (organizationId ? q.eq('organization_id', organizationId) : q);

  const [
    totalOrganizations,
    totalGyms,
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    totalPrograms,
    totalClassTemplates,
    totalAttendanceRecords,
  ] = await Promise.all([
    safeCount('organizations'),
    safeCount('gyms', orgFilter),
    safeCount('students', orgFilter),
    safeCount('students', (q) => orgFilter(q).eq('status', 'active')),
    safeCount('students', (q) =>
      orgFilter(q).gte('created_at', startOfMonth.toISOString()),
    ),
    safeCount('programs', orgFilter),
    safeCount('class_templates', orgFilter),
    // attendance_records doesn't have organization_id in the actual DB schema
    resilientCount('attendance_records'),
  ]);

  return {
    totalOrganizations,
    totalGyms,
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    totalPrograms,
    totalClassTemplates,
    totalAttendanceRecords,
  };
}
