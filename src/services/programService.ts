import { supabase } from '../lib/supabase';
import type { Database, ProgramAgeGroup, ProgramTrainingType } from '../types/database';

export type Program = Database['public']['Tables']['programs']['Row'];
export type ProgramInsert = Database['public']['Tables']['programs']['Insert'];
export type ProgramUpdate = Database['public']['Tables']['programs']['Update'];

export const AGE_GROUP_LABELS: Record<ProgramAgeGroup, string> = {
  kids: 'Kids',
  teens: 'Teens',
  adults: 'Adults',
  all: 'All ages',
};

export const TRAINING_TYPE_LABELS: Record<ProgramTrainingType, string> = {
  gi: 'Gi',
  nogi: 'No-Gi',
  striking: 'Striking',
  mma: 'MMA',
  fitness: 'Fitness',
  private: 'Private',
};

export async function getProgramsByGym(
  gymId: string,
  options: { includeInactive?: boolean } = {},
): Promise<Program[]> {
  let query = supabase
    .from('programs')
    .select('*')
    .eq('gym_id', gymId)
    .order('name', { ascending: true });

  if (!options.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProgram(programId: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createProgram(input: ProgramInsert): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgram(programId: string, input: ProgramUpdate): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .update(input)
    .eq('id', programId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/** Soft delete: programs are deactivated, never hard-deleted from the UI. */
export async function archiveProgram(programId: string): Promise<Program> {
  return updateProgram(programId, { status: 'inactive' });
}

export async function restoreProgram(programId: string): Promise<Program> {
  return updateProgram(programId, { status: 'active' });
}
