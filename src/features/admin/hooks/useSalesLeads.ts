import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  convertSalesLeadToOrganization,
  getSalesLead,
  listSalesLeads,
  updateSalesLeadStatus,
  type ConvertLeadInput,
  type ListSalesLeadsOptions,
} from '../../../services/salesLeadService';
import type { SalesLeadStatus } from '../../../types/database';

export function useSalesLeads(options: ListSalesLeadsOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'sales-leads', options],
    queryFn: () => listSalesLeads(options),
  });
}

export function useSalesLead(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'sales-lead', id],
    queryFn: () => getSalesLead(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateSalesLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: SalesLeadStatus }) =>
      updateSalesLeadStatus(input.id, input.status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales-leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales-lead', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useConvertSalesLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConvertLeadInput) => convertSalesLeadToOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sales-leads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
