import { useQuery } from '@tanstack/react-query';
import { usePortalSummary } from './usePortalSummary';
import {
  getPortalAttendance,
  getPortalClassEnrollments,
  getPortalProgramEnrollments,
} from '../services/portalService';

/** Class enrollments for every student linked to the signed-in portal user. */
export function usePortalClassEnrollments() {
  const summaryQuery = usePortalSummary();
  const students = summaryQuery.data?.linkedStudents ?? [];
  const studentIds = students.map((s) => s.id);

  const enrollmentsQuery = useQuery({
    queryKey: ['portal', 'class-enrollments', studentIds],
    queryFn: () => getPortalClassEnrollments(studentIds),
    enabled: summaryQuery.isSuccess,
  });

  return { summaryQuery, enrollmentsQuery, students };
}

/** Attendance history for every student linked to the signed-in portal user. */
export function usePortalAttendance() {
  const summaryQuery = usePortalSummary();
  const students = summaryQuery.data?.linkedStudents ?? [];
  const studentIds = students.map((s) => s.id);

  const attendanceQuery = useQuery({
    queryKey: ['portal', 'attendance', studentIds],
    queryFn: () => getPortalAttendance(studentIds),
    enabled: summaryQuery.isSuccess,
  });

  return { summaryQuery, attendanceQuery, students };
}

/** Program enrollments for every student linked to the signed-in portal user. */
export function usePortalProgramEnrollments() {
  const summaryQuery = usePortalSummary();
  const students = summaryQuery.data?.linkedStudents ?? [];
  const studentIds = students.map((s) => s.id);

  const enrollmentsQuery = useQuery({
    queryKey: ['portal', 'program-enrollments', studentIds],
    queryFn: () => getPortalProgramEnrollments(studentIds),
    enabled: summaryQuery.isSuccess,
  });

  return { summaryQuery, enrollmentsQuery, students };
}
