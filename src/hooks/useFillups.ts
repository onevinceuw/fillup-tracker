import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Fillup } from '@/types/database';

export function useFillups(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['fillups', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fillups')
        .select('*')
        .eq('vehicle_id', vehicleId!)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Fillup[];
    },
    enabled: !!vehicleId,
  });
}

export function useAllFillups() {
  return useQuery({
    queryKey: ['fillups', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fillups')
        .select('*, vehicles(*)')
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useAddFillup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fillup: Omit<Fillup, 'id' | 'created_at' | 'mpg' | 'cost_per_mile'>) => {
      const { data, error } = await supabase.from('fillups').insert(fillup).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fillups'] }),
  });
}

export function useUpdateFillup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fillup> & { id: string }) => {
      const { error } = await supabase.from('fillups').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fillups'] }),
  });
}

export function useDeleteFillup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fillups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fillups'] }),
  });
}
