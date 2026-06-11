import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveClassTemplate,
  type ClassTemplateInsert,
  type ClassTemplateUpdate,
  createClassTemplate,
  getClassTemplatesByGym,
  restoreClassTemplate,
  updateClassTemplate,
} from '../../../services/classService';

const classesKey = (gymId: string, includeInactive: boolean) =>
  ['class-templates', gymId, { includeInactive }] as const;

export function useClassTemplatesQuery(gymId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: classesKey(gymId ?? '', includeInactive),
    queryFn: () => getClassTemplatesByGym(gymId!, { includeInactive }),
    enabled: Boolean(gymId),
  });
}

function invalidateClasses(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['class-templates'] });
}

export function useCreateClassTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassTemplateInsert) => createClassTemplate(input),
    onSuccess: () => invalidateClasses(queryClient),
  });
}

export function useUpdateClassTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { classTemplateId: string; data: ClassTemplateUpdate }) =>
      updateClassTemplate(input.classTemplateId, input.data),
    onSuccess: () => invalidateClasses(queryClient),
  });
}

export function useArchiveClassTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classTemplateId: string) => archiveClassTemplate(classTemplateId),
    onSuccess: () => invalidateClasses(queryClient),
  });
}

export function useRestoreClassTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classTemplateId: string) => restoreClassTemplate(classTemplateId),
    onSuccess: () => invalidateClasses(queryClient),
  });
}
