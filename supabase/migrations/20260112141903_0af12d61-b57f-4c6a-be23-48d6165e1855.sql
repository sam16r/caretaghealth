-- Create prescription templates table
CREATE TABLE public.prescription_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  diagnosis TEXT,
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;

-- Policies for prescription templates
CREATE POLICY "Doctors can view their own templates"
ON public.prescription_templates
FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create their own templates"
ON public.prescription_templates
FOR INSERT
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their own templates"
ON public.prescription_templates
FOR UPDATE
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete their own templates"
ON public.prescription_templates
FOR DELETE
USING (doctor_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_prescription_templates_updated_at
BEFORE UPDATE ON public.prescription_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add refill tracking columns to prescriptions
ALTER TABLE public.prescriptions
ADD COLUMN IF NOT EXISTS refill_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_refills INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_refill_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_refill_reminder DATE;