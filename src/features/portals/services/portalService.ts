import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database';

export type LinkedStudent = Database['public']['Tables']['students']['Row'] & {
  link_source: 'self' | 'parent';
};

type StudentRow = Database['public']['Tables']['students']['Row'];

/**
 * Loads every student row the portal user can see, via:
 *   - student_user_links (the user IS this student)
 *   - parent_user_links -> family_members -> students (children)
 *
 * RLS already restricts students_select_linked_portal to exactly these rows.
 */
export async function listPortalStudents(profileId: string): Promise<LinkedStudent[]> {
  const selfLinksPromise = supabase
    .from('student_user_links')
    .select('student_id, students(*)')
    .eq('profile_id', profileId)
    .eq('status', 'active');

  const parentLinksPromise = supabase
    .from('parent_user_links')
    .select('family_id')
    .eq('profile_id', profileId);

  const [selfLinks, parentLinks] = await Promise.all([selfLinksPromise, parentLinksPromise]);
  if (selfLinks.error) throw selfLinks.error;
  if (parentLinks.error) throw parentLinks.error;

  const seen = new Set<string>();
  const result: LinkedStudent[] = [];

  for (const row of (selfLinks.data ?? []) as unknown as {
    student_id: string;
    students: StudentRow | null;
  }[]) {
    if (row.students && !seen.has(row.students.id)) {
      seen.add(row.students.id);
      result.push({ ...row.students, link_source: 'self' });
    }
  }

  const familyIds = (parentLinks.data ?? []).map((row) => row.family_id);
  if (familyIds.length > 0) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .in('family_id', familyIds);
    if (error) throw error;
    for (const student of data ?? []) {
      if (seen.has(student.id)) continue;
      seen.add(student.id);
      result.push({ ...student, link_source: 'parent' });
    }
  }

  return result;
}

export type PortalSummary = {
  linkedStudents: LinkedStudent[];
  hasSelfLink: boolean;
  hasParentLink: boolean;
};

export async function getPortalSummary(profileId: string): Promise<PortalSummary> {
  const linkedStudents = await listPortalStudents(profileId);
  return {
    linkedStudents,
    hasSelfLink: linkedStudents.some((s) => s.link_source === 'self'),
    hasParentLink: linkedStudents.some((s) => s.link_source === 'parent'),
  };
}

/**
 * Returns the single student the authenticated user is linked to via
 * student_user_links. Used by the portal profile/schedule/progress pages.
 * If a user has multiple self-links (rare), returns the most recent.
 */
export async function getCurrentStudentProfile(
  profileId: string,
): Promise<StudentRow | null> {
  const { data, error } = await supabase
    .from('student_user_links')
    .select('student_id, students(*)')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as unknown as { students: StudentRow | null }[];
  const first = rows.find((row) => row.students);
  return first?.students ?? null;
}

export type PortalClassEnrollment = {
  id: string;
  student_id: string;
  class_templates: {
    id: string;
    name: string;
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
    programs: { name: string } | null;
  } | null;
};

/**
 * Active class enrollments for the given linked students, with the class
 * template details needed to render the weekly portal schedule. RLS limits
 * rows to students the caller is actively linked to.
 */
export async function getPortalClassEnrollments(
  studentIds: string[],
): Promise<PortalClassEnrollment[]> {
  if (studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select(
      'id, student_id, class_templates(id, name, day_of_week, start_time, end_time, programs(name))',
    )
    .in('student_id', studentIds)
    .eq('status', 'active');

  if (error) throw error;
  return (data ?? []) as unknown as PortalClassEnrollment[];
}

export type PortalProgramEnrollment = {
  id: string;
  student_id: string;
  started_at: string;
  programs: { name: string } | null;
  ranks: { name: string; color: string | null } | null;
};

/** Active program enrollments (program + current rank) for linked students. */
export async function getPortalProgramEnrollments(
  studentIds: string[],
): Promise<PortalProgramEnrollment[]> {
  if (studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('student_program_enrollments')
    .select('id, student_id, started_at, programs(name), ranks(name, color)')
    .in('student_id', studentIds)
    .eq('status', 'active');

  if (error) throw error;
  return (data ?? []) as unknown as PortalProgramEnrollment[];
}

export type PortalAttendanceEntry = {
  id: string;
  student_id: string;
  status: string;
  checked_in_at: string;
  class_sessions: {
    session_date: string;
    class_templates: { name: string; programs: { name: string } | null } | null;
  } | null;
};

/**
 * Attendance records for the caller's linked students, most recent first.
 * RLS restricts rows to actively linked students, so a portal user can never
 * read another student's attendance.
 */
export async function getPortalAttendance(
  studentIds: string[],
  limit = 50,
): Promise<PortalAttendanceEntry[]> {
  if (studentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('attendance_records')
    .select(
      'id, student_id, status, checked_in_at, class_sessions(session_date, class_templates(name, programs(name)))',
    )
    .in('student_id', studentIds)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as PortalAttendanceEntry[];
}

export type PortalProgress = {
  belt: string | null;
  stripes: number;
  status: StudentRow['status'];
};

/** Belt / stripe / membership progress for the linked student. */
export async function getCurrentStudentProgress(
  profileId: string,
): Promise<PortalProgress | null> {
  const student = await getCurrentStudentProfile(profileId);
  if (!student) return null;
  return {
    belt: student.belt,
    stripes: student.stripes ?? 0,
    status: student.status,
  };
}
