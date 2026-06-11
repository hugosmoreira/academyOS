import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveStudent,
  createStudent,
  getStudent,
  listStudents,
  type ListStudentsOptions,
  restoreStudent,
  type Student,
  type StudentInsert,
  type StudentUpdate,
  updateStudent,
} from '../../../services/studentService';
import {
  cancelInvite,
  createInvite,
  createTestingPortalLogin,
  disablePortalAccess,
  getStudentPortalStatus,
  resendInvite,
} from '../../../services/studentPortalInviteService';

const studentsKey = (options: ListStudentsOptions) => ['students', options] as const;

export function useStudentsQuery(options: ListStudentsOptions) {
  const { enabled = true, ...queryOptions } = options;
  return useQuery({
    queryKey: studentsKey(queryOptions),
    queryFn: () => listStudents(queryOptions),
    enabled,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInsert) => createStudent(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, { id: string; input: StudentUpdate }>({
    mutationFn: ({ id, input }) => updateStudent(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useArchiveStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveStudent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRestoreStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreStudent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStudentQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['student', id] as const,
    queryFn: () => (id ? getStudent(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

const portalStatusKey = (studentId: string) => ['student-portal-status', studentId] as const;

export function useStudentPortalStatus(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-portal-status', studentId ?? ''] as const,
    queryFn: () => getStudentPortalStatus(studentId as string),
    enabled: Boolean(studentId),
  });
}

function invalidatePortalState(queryClient: ReturnType<typeof useQueryClient>, studentId: string) {
  void queryClient.invalidateQueries({ queryKey: portalStatusKey(studentId) });
  void queryClient.invalidateQueries({ queryKey: ['students'] });
  void queryClient.invalidateQueries({ queryKey: ['student', studentId] });
}

export function useCreatePortalInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentId: string; email?: string | null }) =>
      createInvite(input.studentId, input.email ?? null),
    onSuccess: (_data, vars) => invalidatePortalState(queryClient, vars.studentId),
  });
}

export function useResendPortalInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { inviteId: string; studentId: string }) => resendInvite(input.inviteId),
    onSuccess: (_data, vars) => invalidatePortalState(queryClient, vars.studentId),
  });
}

export function useCancelPortalInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { inviteId: string; studentId: string }) => cancelInvite(input.inviteId),
    onSuccess: (_data, vars) => invalidatePortalState(queryClient, vars.studentId),
  });
}

export function useCreateTestingPortalLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentId: string; email?: string | null; temporaryPassword?: string | null }) =>
      createTestingPortalLogin(input),
    onSuccess: (_data, vars) => invalidatePortalState(queryClient, vars.studentId),
  });
}

export function useDisablePortalAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentId: string }) => disablePortalAccess(input.studentId),
    onSuccess: (_data, vars) => invalidatePortalState(queryClient, vars.studentId),
  });
}
