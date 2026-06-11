import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveProgram,
  createProgram,
  getProgram,
  getProgramsByGym,
  type ProgramInsert,
  type ProgramUpdate,
  restoreProgram,
  updateProgram,
} from '../../../services/programService';
import {
  archiveRank,
  createRank,
  getRanksByProgram,
  type RankInsert,
  type RankUpdate,
  reorderRanks,
  updateRank,
} from '../../../services/rankService';

const programsKey = (gymId: string, includeInactive: boolean) =>
  ['programs', gymId, { includeInactive }] as const;
const ranksKey = (programId: string) => ['ranks', programId] as const;

export function useProgramsQuery(gymId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: programsKey(gymId ?? '', includeInactive),
    queryFn: () => getProgramsByGym(gymId!, { includeInactive }),
    enabled: Boolean(gymId),
  });
}

export function useProgramQuery(programId: string | undefined) {
  return useQuery({
    queryKey: ['program', programId] as const,
    queryFn: () => getProgram(programId!),
    enabled: Boolean(programId),
  });
}

function invalidatePrograms(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['programs'] });
  void queryClient.invalidateQueries({ queryKey: ['program'] });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProgramInsert) => createProgram(input),
    onSuccess: () => invalidatePrograms(queryClient),
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { programId: string; data: ProgramUpdate }) =>
      updateProgram(input.programId, input.data),
    onSuccess: () => invalidatePrograms(queryClient),
  });
}

export function useArchiveProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: string) => archiveProgram(programId),
    onSuccess: () => invalidatePrograms(queryClient),
  });
}

export function useRestoreProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: string) => restoreProgram(programId),
    onSuccess: () => invalidatePrograms(queryClient),
  });
}

// ---------------------------------------------------------------------------
// Ranks
// ---------------------------------------------------------------------------

export function useRanksQuery(programId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: [...ranksKey(programId ?? ''), { includeInactive }] as const,
    queryFn: () => getRanksByProgram(programId!, { includeInactive }),
    enabled: Boolean(programId),
  });
}

function invalidateRanks(queryClient: ReturnType<typeof useQueryClient>, programId: string) {
  void queryClient.invalidateQueries({ queryKey: ranksKey(programId) });
}

export function useCreateRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RankInsert) => createRank(input),
    onSuccess: (_data, vars) => invalidateRanks(queryClient, vars.program_id),
  });
}

export function useUpdateRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rankId: string; programId: string; data: RankUpdate }) =>
      updateRank(input.rankId, input.data),
    onSuccess: (_data, vars) => invalidateRanks(queryClient, vars.programId),
  });
}

export function useReorderRanks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { programId: string; orderedRankIds: string[] }) =>
      reorderRanks(input.programId, input.orderedRankIds),
    onSuccess: (_data, vars) => invalidateRanks(queryClient, vars.programId),
  });
}

export function useArchiveRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { rankId: string; programId: string }) => archiveRank(input.rankId),
    onSuccess: (_data, vars) => invalidateRanks(queryClient, vars.programId),
  });
}
