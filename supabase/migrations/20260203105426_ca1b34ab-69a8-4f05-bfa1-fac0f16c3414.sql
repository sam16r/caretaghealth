-- Create a secure function to get dashboard stats
-- This bypasses RLS but only returns aggregate counts, no sensitive data
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  today_start timestamptz;
BEGIN
  -- Verify user has doctor or admin role
  IF NOT (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role)) THEN
    RETURN json_build_object(
      'total_patients', 0,
      'today_appointments', 0,
      'active_prescriptions', 0,
      'active_emergencies', 0
    );
  END IF;

  today_start := date_trunc('day', now());

  SELECT json_build_object(
    'total_patients', (SELECT count(*) FROM public.patients),
    'today_appointments', (SELECT count(*) FROM public.appointments WHERE scheduled_at >= today_start AND scheduled_at < today_start + interval '1 day'),
    'active_prescriptions', (SELECT count(*) FROM public.prescriptions WHERE status = 'active'),
    'active_emergencies', (SELECT count(*) FROM public.emergency_records WHERE resolved_at IS NULL)
  ) INTO result;

  RETURN result;
END;
$$;