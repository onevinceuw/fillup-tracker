import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/database';
import { useUser } from '@/contexts/UserContext';

export function useVehicles() {
  const { currentUser } = useUser();
  return useQuery({
    queryKey: ['vehicles', currentUser],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('nickname', currentUser!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!currentUser,
  });
}

export function useAllVehicles() {
  const { currentUser } = useUser();
  return useQuery({
    queryKey: ['vehicles', currentUser],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Vehicle[];
    },
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...vehicle })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      const { error } = await supabase.from('vehicles').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}
