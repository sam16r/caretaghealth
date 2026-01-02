import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, startOfMonth, subMonths, format, eachDayOfInterval, subDays } from 'date-fns';

export function useAnalyticsData() {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));
      const last30Days = subDays(now, 30);

      // Get all patients for demographics
      const { data: patients } = await supabase
        .from('patients')
        .select('id, gender, blood_group, chronic_conditions, allergies, created_at, date_of_birth');

      // Get appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, scheduled_at, status, created_at')
        .gte('created_at', last30Days.toISOString());

      // Get prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('id, status, created_at, medications')
        .gte('created_at', last30Days.toISOString());

      // Get emergency records
      const { data: emergencies } = await supabase
        .from('emergency_records')
        .select('id, severity, created_at, resolved_at')
        .gte('created_at', last30Days.toISOString());

      // Calculate gender distribution
      const genderDistribution = {
        male: patients?.filter(p => p.gender === 'Male').length || 0,
        female: patients?.filter(p => p.gender === 'Female').length || 0,
        other: patients?.filter(p => !['Male', 'Female'].includes(p.gender)).length || 0,
      };

      // Calculate blood group distribution
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const bloodGroupDistribution = bloodGroups.map(group => ({
        group,
        count: patients?.filter(p => p.blood_group === group).length || 0,
      }));

      // Calculate age distribution
      const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age;
      };

      const ageGroups = [
        { label: '0-18', min: 0, max: 18, count: 0 },
        { label: '19-35', min: 19, max: 35, count: 0 },
        { label: '36-50', min: 36, max: 50, count: 0 },
        { label: '51-65', min: 51, max: 65, count: 0 },
        { label: '65+', min: 66, max: 150, count: 0 },
      ];

      patients?.forEach(p => {
        const age = calculateAge(p.date_of_birth);
        const group = ageGroups.find(g => age >= g.min && age <= g.max);
        if (group) group.count++;
      });

      // Top chronic conditions
      const conditionCounts: Record<string, number> = {};
      patients?.forEach(p => {
        p.chronic_conditions?.forEach((condition: string) => {
          conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });
      });
      const topConditions = Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      // Top allergies
      const allergyCounts: Record<string, number> = {};
      patients?.forEach(p => {
        p.allergies?.forEach((allergy: string) => {
          allergyCounts[allergy] = (allergyCounts[allergy] || 0) + 1;
        });
      });
      const topAllergies = Object.entries(allergyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      // Daily patient registrations (last 14 days)
      const last14Days = eachDayOfInterval({
        start: subDays(now, 13),
        end: now,
      });

      const dailyRegistrations = last14Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const count = patients?.filter(p => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === dayStr
        ).length || 0;
        return {
          date: format(day, 'MMM d'),
          count,
        };
      });

      // Appointment status breakdown
      const appointmentStatus = {
        scheduled: appointments?.filter(a => a.status === 'scheduled').length || 0,
        completed: appointments?.filter(a => a.status === 'completed').length || 0,
        cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
        noShow: appointments?.filter(a => a.status === 'no_show').length || 0,
      };

      // Emergency severity breakdown
      const emergencySeverity = {
        low: emergencies?.filter(e => e.severity === 'low').length || 0,
        medium: emergencies?.filter(e => e.severity === 'medium').length || 0,
        high: emergencies?.filter(e => e.severity === 'high').length || 0,
        critical: emergencies?.filter(e => e.severity === 'critical').length || 0,
      };

      return {
        totalPatients: patients?.length || 0,
        totalAppointments: appointments?.length || 0,
        totalPrescriptions: prescriptions?.length || 0,
        totalEmergencies: emergencies?.length || 0,
        genderDistribution,
        bloodGroupDistribution,
        ageGroups,
        topConditions,
        topAllergies,
        dailyRegistrations,
        appointmentStatus,
        emergencySeverity,
        patientsWithConditions: patients?.filter(p => p.chronic_conditions && p.chronic_conditions.length > 0).length || 0,
        patientsWithAllergies: patients?.filter(p => p.allergies && p.allergies.length > 0).length || 0,
      };
    },
  });
}
