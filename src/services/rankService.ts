import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Rank = Database['public']['Tables']['ranks']['Row'];
export type RankInsert = Database['public']['Tables']['ranks']['Insert'];
export type RankUpdate = Database['public']['Tables']['ranks']['Update'];

export async function getRanksByProgram(
  programId: string,
  options: { includeInactive?: boolean } = {},
): Promise<Rank[]> {
  let query = supabase
    .from('ranks')
    .select('*')
    .eq('program_id', programId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (!options.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createRank(input: RankInsert): Promise<Rank> {
  const { data, error } = await supabase
    .from('ranks')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateRank(rankId: string, input: RankUpdate): Promise<Rank> {
  const { data, error } = await supabase
    .from('ranks')
    .update(input)
    .eq('id', rankId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/** Persists a new ordering: orderedRankIds[i] gets order_index = i. */
export async function reorderRanks(programId: string, orderedRankIds: string[]): Promise<void> {
  const updates = orderedRankIds.map((rankId, index) =>
    supabase
      .from('ranks')
      .update({ order_index: index })
      .eq('id', rankId)
      .eq('program_id', programId),
  );
  const results = await Promise.all(updates);
  for (const { error } of results) {
    if (error) throw error;
  }
}

export async function archiveRank(rankId: string): Promise<Rank> {
  return updateRank(rankId, { status: 'inactive' });
}
