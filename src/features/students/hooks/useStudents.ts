import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveStudent,
  createStudent,
  listStudents,
  type ListStudentsOptions,
  restoreStudent,
  type Student,
  type StudentInsert,
  type StudentUpdate,
  updateStudent,
} from '../../../services/studentService';

const studentsKey = (options: ListStudentsOptions) => ['students', options] as const;

export function useStudentsQuery(options: ListStudentsOptions) {
  return useQuery({
    queryKey: studentsKey(options),
    queryFn: () => listStudents(options),
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
