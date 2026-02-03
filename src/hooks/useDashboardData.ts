import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  total_patients: number;
  today_appointments: number;
  active_prescriptions: number;
  active_emergencies: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Use secure RPC function that bypasses RLS but only returns counts
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) throw error;

      const stats = data as unknown as DashboardStats;

      return {
        totalPatients: stats?.total_patients || 0,
        todayAppointments: stats?.today_appointments || 0,
        activePrescriptions: stats?.active_prescriptions || 0,
        activeEmergencies: stats?.active_emergencies || 0,
      };
    },
  });
}

// Returns limited patient info (no active session required)
export function useRecentPatients(limit = 5) {
  return useQuery({
    queryKey: ['recent-patients-limited', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_patients_limited');

      if (error) throw error;
      // Return limited data - only name, caretag, emergency contact
      return (data || []).slice(0, limit);
    },
  });
}

export function useTodayAppointments() {
  return useQuery({
    queryKey: ['today-appointments'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (id, full_name, caretag_id)
        `)
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', tomorrow.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useActiveEmergencies() {
  return useQuery({
    queryKey: ['active-emergencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_records')
        .select(`
          *,
          patients:patient_id (id, full_name, caretag_id, blood_group, allergies)
        `)
        .is('resolved_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useRecentVitals(limit = 10) {
  return useQuery({
    queryKey: ['recent-vitals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vitals')
        .select(`
          *,
          patients:patient_id (id, full_name, caretag_id)
        `)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
