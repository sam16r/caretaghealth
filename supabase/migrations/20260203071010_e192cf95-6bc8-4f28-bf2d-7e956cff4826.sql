-- Fix 1: Restrict waitlist visibility to relevant doctors only
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.appointment_waitlist;

CREATE POLICY "Doctors and admins can view relevant waitlist entries"
ON public.appointment_waitlist FOR SELECT
USING (
  doctor_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Restrict messages visibility when patient_id is set
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- Create new policy with session-based check for patient-related messages
CREATE POLICY "Users can view their messages with patient session check"
ON public.messages FOR SELECT
USING (
  (sender_id = auth.uid() OR recipient_id = auth.uid())
  AND (
    -- If no patient_id, allow normal viewing
    patient_id IS NULL
    -- If patient_id is set, require active session OR admin role
    OR has_active_session(auth.uid(), patient_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);