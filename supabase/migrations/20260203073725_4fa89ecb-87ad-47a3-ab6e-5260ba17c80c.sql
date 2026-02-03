-- Drop existing SELECT policies on patients table
DROP POLICY IF EXISTS "Doctors and admins can view patients" ON public.patients;

-- Create a new restrictive SELECT policy that requires active session for full data
CREATE POLICY "Full patient data requires active session"
ON public.patients
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (has_role(auth.uid(), 'doctor'::app_role) AND has_active_session(auth.uid(), id))
);

-- Create a secure view for limited patient info (used for patient listing)
CREATE OR REPLACE VIEW public.patients_limited AS
SELECT 
  id,
  full_name,
  caretag_id,
  emergency_contact_name,
  emergency_contact_phone
FROM public.patients;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.patients_limited TO authenticated;

-- Create a security definer function to get limited patient data
-- This bypasses RLS but only returns safe columns
CREATE OR REPLACE FUNCTION public.get_patients_limited()
RETURNS TABLE (
  id uuid,
  full_name text,
  caretag_id text,
  emergency_contact_name text,
  emergency_contact_phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.caretag_id,
    p.emergency_contact_name,
    p.emergency_contact_phone
  FROM public.patients p
  WHERE has_role(auth.uid(), 'doctor'::app_role) 
     OR has_role(auth.uid(), 'admin'::app_role)
$$;