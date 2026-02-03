-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;

-- Create restrictive policy: only treating doctor or admin can view invoices
CREATE POLICY "Relevant parties can view invoices"
ON public.invoices FOR SELECT
USING (
  doctor_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);