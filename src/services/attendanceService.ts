import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Student } from './studentService';

export type ClassSession = Database['public']['Tables']['class_sessions']['Row'];
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
export type AttendanceStatus = Database['public']['Enums']['attendance_status'];

export type ClassSessionWithTemplate = ClassSession & {
  class_templates: {
    id: string;
    name: string;
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
    capacity: number | null;
    programs: { id: string; name: string } | null;
    profiles: { id: string; full_name: string | null } | null;
  } | null;
};

export type AttendanceRecordWithStudent = AttendanceRecord & {
  students: { id: string; first_name: string; last_name: string; belt: string | null } | null;
};

export type StudentAttendanceEntry = AttendanceRecord & {
  class_sessions: {
    id: string;
    session_date: string;
    start_time: string | null;
    class_templates: {
      name: string;
      profiles: { full_name: string | null } | null;
    } | null;
  } | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function getClassSessionsByDate(
  gymId: string,
  date: string,
): Promise<ClassSessionWithTemplate[]> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select(
      '*, class_templates(id, name, day_of_week, start_time, end_time, capacity, programs(id, name), profiles(id, full_name))',
    )
    .eq('gym_id', gymId)
    .eq('session_date', date)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ClassSessionWithTemplate[];
}

export async function getTodayClassSessions(gymId: string): Promise<ClassSessionWithTemplate[]> {
  return getClassSessionsByDate(gymId, todayISO());
}

/**
 * Returns the session for a class template on a date, creating it if needed.
 * The unique(class_template_id, session_date) index makes this race-safe:
 * a concurrent insert surfaces as 23505 and we re-fetch.
 */
export async function getOrCreateClassSession(
  classTemplateId: string,
  date: string,
): Promise<ClassSession> {
  const { data: existing, error: lookupError } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('class_template_id', classTemplateId)
    .eq('session_date', date)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: template, error: templateError } = await supabase
    .from('class_templates')
    .select('id, organization_id, gym_id, start_time, end_time')
    .eq('id', classTemplateId)
    .maybeSingle();
  if (templateError) throw templateError;
  if (!template) throw new Error('Class template not found.');

  const { data: created, error: insertError } = await supabase
    .from('class_sessions')
    .insert({
      organization_id: template.organization_id,
      gym_id: template.gym_id,
      class_template_id: classTemplateId,
      session_date: date,
      start_time: template.start_time,
      end_time: template.end_time,
      status: 'scheduled',
    })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: raced, error: refetchError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('class_template_id', classTemplateId)
        .eq('session_date', date)
        .single();
      if (refetchError) throw refetchError;
      return raced;
    }
    throw insertError;
  }
  return created;
}

// ---------------------------------------------------------------------------
// Roster / eligibility
// ---------------------------------------------------------------------------

export async function getAttendanceForSession(
  classSessionId: string,
): Promise<AttendanceRecordWithStudent[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, students(id, first_name, last_name, belt)')
    .eq('class_session_id', classSessionId)
    .order('checked_in_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AttendanceRecordWithStudent[];
}

/** Students with an active enrollment in the class template. */
export async function getEligibleStudentsForClass(
  classTemplateId: string,
): Promise<Student[]> {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .select('students(*)')
    .eq('class_template_id', classTemplateId)
    .eq('status', 'active');

  if (error) throw error;
  const rows = (data ?? []) as unknown as { students: Student | null }[];
  return rows
    .flatMap((row) => (row.students ? [row.students] : []))
    .sort((a, b) =>
      `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`),
    );
}

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------

export type CheckInInput = {
  organizationId: string;
  gymId: string;
  classSessionId: string;
  classTemplateId?: string | null;
  studentId: string;
  checkedInBy?: string | null;
  status?: AttendanceStatus;
  notes?: string | null;
};

export async function checkInStudent(input: CheckInInput): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      organization_id: input.organizationId,
      gym_id: input.gymId,
      class_session_id: input.classSessionId,
      class_template_id: input.classTemplateId ?? null,
      student_id: input.studentId,
      checked_in_by: input.checkedInBy ?? null,
      status: input.status ?? 'present',
      notes: input.notes ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This student is already checked in for this class.');
    }
    throw error;
  }
  return data;
}

export async function undoCheckIn(attendanceRecordId: string): Promise<void> {
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', attendanceRecordId);
  if (error) throw error;
}

export async function markStudentAbsent(
  input: Omit<CheckInInput, 'status'>,
): Promise<AttendanceRecord> {
  return checkInStudent({ ...input, status: 'absent' });
}

// ---------------------------------------------------------------------------
// History / summaries
// ---------------------------------------------------------------------------

export async function getStudentAttendance(
  studentId: string,
  limit = 100,
): Promise<StudentAttendanceEntry[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(
      '*, class_sessions(id, session_date, start_time, class_templates(name, profiles(full_name)))',
    )
    .eq('student_id', studentId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as StudentAttendanceEntry[];
}

export type GymAttendanceSummary = {
  checkedInToday: number;
  attendanceThisWeek: number;
};

export async function getAttendanceSummaryByGym(gymId: string): Promise<GymAttendanceSummary> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const [today, week] = await Promise.all([
    supabase
      .from('attendance_records')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .in('status', ['present', 'late'])
      .gte('checked_in_at', startOfToday.toISOString()),
    supabase
      .from('attendance_records')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .in('status', ['present', 'late'])
      .gte('checked_in_at', startOfWeek.toISOString()),
  ]);

  if (today.error) throw today.error;
  if (week.error) throw week.error;

  return {
    checkedInToday: today.count ?? 0,
    attendanceThisWeek: week.count ?? 0,
  };
}
