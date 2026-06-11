import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type StudentProgramEnrollment =
  Database['public']['Tables']['student_program_enrollments']['Row'];
export type StudentProgramEnrollmentInsert =
  Database['public']['Tables']['student_program_enrollments']['Insert'];
export type StudentProgramEnrollmentUpdate =
  Database['public']['Tables']['student_program_enrollments']['Update'];

export type StudentClassEnrollment =
  Database['public']['Tables']['student_class_enrollments']['Row'];
export type StudentClassEnrollmentInsert =
  Database['public']['Tables']['student_class_enrollments']['Insert'];
export type StudentClassEnrollmentUpdate =
  Database['public']['Tables']['student_class_enrollments']['Update'];

export type ProgramEnrollmentWithRelations = StudentProgramEnrollment & {
  programs: { id: string; name: string; status: string } | null;
  ranks: { id: string; name: string; color: string | null } | null;
};

export type ClassEnrollmentWithRelations = StudentClassEnrollment & {
  class_templates: {
    id: string;
    name: string;
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    program_id: string | null;
    programs: { id: string; name: string } | null;
  } | null;
};

// ---------------------------------------------------------------------------
// Program enrollments
// ---------------------------------------------------------------------------

export async function getStudentProgramEnrollments(
  studentId: string,
  options: { includeInactive?: boolean } = {},
): Promise<ProgramEnrollmentWithRelations[]> {
  let query = supabase
    .from('student_program_enrollments')
    .select('*, programs(id, name, status), ranks(id, name, color)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (!options.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProgramEnrollmentWithRelations[];
}

export async function enrollStudentInProgram(
  input: StudentProgramEnrollmentInsert,
): Promise<StudentProgramEnrollment> {
  const { data, error } = await supabase
    .from('student_program_enrollments')
    .insert(input)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This student already has an enrollment in that program.');
    }
    throw error;
  }
  return data;
}

export async function updateStudentProgramEnrollment(
  id: string,
  input: StudentProgramEnrollmentUpdate,
): Promise<StudentProgramEnrollment> {
  const { data, error } = await supabase
    .from('student_program_enrollments')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateStudentProgramEnrollment(
  id: string,
): Promise<StudentProgramEnrollment> {
  return updateStudentProgramEnrollment(id, {
    status: 'inactive',
    ended_at: new Date().toISOString().slice(0, 10),
  });
}

// ---------------------------------------------------------------------------
// Class enrollments
// ---------------------------------------------------------------------------

export async function getStudentClassEnrollments(
  studentId: string,
  options: { includeInactive?: boolean } = {},
): Promise<ClassEnrollmentWithRelations[]> {
  let query = supabase
    .from('student_class_enrollments')
    .select(
      '*, class_templates(id, name, day_of_week, start_time, end_time, status, program_id, programs(id, name))',
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (!options.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ClassEnrollmentWithRelations[];
}

export async function enrollStudentInClass(
  input: StudentClassEnrollmentInsert,
): Promise<StudentClassEnrollment> {
  // The unique(student_id, class_template_id) constraint means a previously
  // removed class can be re-assigned by reactivating the old row.
  const { data: existing, error: lookupError } = await supabase
    .from('student_class_enrollments')
    .select('id, status')
    .eq('student_id', input.student_id)
    .eq('class_template_id', input.class_template_id)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('This student is already assigned to that class.');
    }
    return updateStudentClassEnrollment(existing.id, { status: 'active' });
  }

  const { data, error } = await supabase
    .from('student_class_enrollments')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudentClassEnrollment(
  id: string,
  input: StudentClassEnrollmentUpdate,
): Promise<StudentClassEnrollment> {
  const { data, error } = await supabase
    .from('student_class_enrollments')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateStudentClassEnrollment(
  id: string,
): Promise<StudentClassEnrollment> {
  return updateStudentClassEnrollment(id, { status: 'inactive' });
}
