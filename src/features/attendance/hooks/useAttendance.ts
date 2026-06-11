import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CheckInInput,
  checkInStudent,
  getAttendanceForSession,
  getClassSessionsByDate,
  getEligibleStudentsForClass,
  getOrCreateClassSession,
  getStudentAttendance,
  markStudentAbsent,
  undoCheckIn,
} from '../../../services/attendanceService';

const sessionsKey = (gymId: string, date: string) => ['class-sessions', gymId, date] as const;
const rosterKey = (sessionId: string) => ['session-attendance', sessionId] as const;
const eligibleKey = (templateId: string) => ['class-eligible-students', templateId] as const;
const studentHistoryKey = (studentId: string) => ['student-attendance', studentId] as const;

export function useClassSessionsByDate(gymId: string | undefined, date: string) {
  return useQuery({
    queryKey: sessionsKey(gymId ?? '', date),
    queryFn: () => getClassSessionsByDate(gymId!, date),
    enabled: Boolean(gymId && date),
  });
}

export function useSessionAttendance(classSessionId: string | undefined) {
  return useQuery({
    queryKey: rosterKey(classSessionId ?? ''),
    queryFn: () => getAttendanceForSession(classSessionId!),
    enabled: Boolean(classSessionId),
  });
}

export function useEligibleStudents(classTemplateId: string | undefined | null) {
  return useQuery({
    queryKey: eligibleKey(classTemplateId ?? ''),
    queryFn: () => getEligibleStudentsForClass(classTemplateId!),
    enabled: Boolean(classTemplateId),
  });
}

export function useStudentAttendance(studentId: string | undefined) {
  return useQuery({
    queryKey: studentHistoryKey(studentId ?? ''),
    queryFn: () => getStudentAttendance(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useGetOrCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { classTemplateId: string; date: string }) =>
      getOrCreateClassSession(input.classTemplateId, input.date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
    },
  });
}

function invalidateAttendance(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionId: string,
  studentId: string,
) {
  void queryClient.invalidateQueries({ queryKey: rosterKey(sessionId) });
  void queryClient.invalidateQueries({ queryKey: studentHistoryKey(studentId) });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCheckInStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckInInput) => checkInStudent(input),
    onSuccess: (_data, vars) =>
      invalidateAttendance(queryClient, vars.classSessionId, vars.studentId),
  });
}

export function useMarkStudentAbsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CheckInInput, 'status'>) => markStudentAbsent(input),
    onSuccess: (_data, vars) =>
      invalidateAttendance(queryClient, vars.classSessionId, vars.studentId),
  });
}

export function useUndoCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { attendanceRecordId: string; classSessionId: string; studentId: string }) =>
      undoCheckIn(input.attendanceRecordId),
    onSuccess: (_data, vars) =>
      invalidateAttendance(queryClient, vars.classSessionId, vars.studentId),
  });
}
