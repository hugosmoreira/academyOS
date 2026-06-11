import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type ClassTemplate = Database['public']['Tables']['class_templates']['Row'];
export type ClassTemplateInsert = Database['public']['Tables']['class_templates']['Insert'];
export type ClassTemplateUpdate = Database['public']['Tables']['class_templates']['Update'];

export type ClassTemplateWithRelations = ClassTemplate & {
  programs: { id: string; name: string } | null;
  profiles: { id: string; full_name: string | null; email: string } | null;
};

export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** "18:30:00" -> "6:30 PM" */
export function formatClassTime(time: string | null): string {
  if (!time) return '—';
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr} ${suffix}`;
}

export async function getClassTemplatesByGym(
  gymId: string,
  options: { includeInactive?: boolean } = {},
): Promise<ClassTemplateWithRelations[]> {
  let query = supabase
    .from('class_templates')
    .select('*, programs(id, name), profiles(id, full_name, email)')
    .eq('gym_id', gymId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (!options.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ClassTemplateWithRelations[];
}

export async function createClassTemplate(
  input: ClassTemplateInsert,
): Promise<ClassTemplate> {
  const { data, error } = await supabase
    .from('class_templates')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateClassTemplate(
  classTemplateId: string,
  input: ClassTemplateUpdate,
): Promise<ClassTemplate> {
  const { data, error } = await supabase
    .from('class_templates')
    .update(input)
    .eq('id', classTemplateId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/** Soft delete: classes are deactivated, never hard-deleted from the UI. */
export async function archiveClassTemplate(classTemplateId: string): Promise<ClassTemplate> {
  return updateClassTemplate(classTemplateId, { status: 'inactive' });
}

export async function restoreClassTemplate(classTemplateId: string): Promise<ClassTemplate> {
  return updateClassTemplate(classTemplateId, { status: 'active' });
}
