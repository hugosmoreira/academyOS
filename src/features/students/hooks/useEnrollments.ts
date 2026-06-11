import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deactivateStudentClassEnrollment,
  deactivateStudentProgramEnrollment,
  enrollStudentInClass,
  enrollStudentInProgram,
  getStudentClassEnrollments,
  getStudentProgramEnrollments,
  type StudentClassEnrollmentInsert,
  type StudentProgramEnrollmentInsert,
  type StudentProgramEnrollmentUpdate,
  updateStudentProgramEnrollment,
} from '../../../services/studentEnrollmentService';

const programEnrollmentsKey = (studentId: string) =>
  ['student-program-enrollments', studentId] as const;
const classEnrollmentsKey = (studentId: string) =>
  ['student-class-enrollments', studentId] as const;

export function useStudentProgramEnrollments(studentId: string | undefined) {
  return useQuery({
    queryKey: programEnrollmentsKey(studentId ?? ''),
    queryFn: () => getStudentProgramEnrollments(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useStudentClassEnrollments(studentId: string | undefined) {
  return useQuery({
    queryKey: classEnrollmentsKey(studentId ?? ''),
    queryFn: () => getStudentClassEnrollments(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useEnrollStudentInProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentProgramEnrollmentInsert) => enrollStudentInProgram(input),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: programEnrollmentsKey(vars.student_id) });
    },
  });
}

export function useUpdateProgramEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; studentId: string; data: StudentProgramEnrollmentUpdate }) =>
      updateStudentProgramEnrollment(input.id, input.data),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: programEnrollmentsKey(vars.studentId) });
    },
  });
}

export function useDeactivateProgramEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; studentId: string }) =>
      deactivateStudentProgramEnrollment(input.id),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: programEnrollmentsKey(vars.studentId) });
    },
  });
}

export function useEnrollStudentInClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentClassEnrollmentInsert) => enrollStudentInClass(input),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: classEnrollmentsKey(vars.student_id) });
    },
  });
}

export function useDeactivateClassEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; studentId: string }) =>
      deactivateStudentClassEnrollment(input.id),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: classEnrollmentsKey(vars.studentId) });
    },
  });
}
