-- Drop the SECURITY DEFINER view as it's a security risk
-- We'll use the security definer function instead which is safer
DROP VIEW IF EXISTS public.patients_limited;