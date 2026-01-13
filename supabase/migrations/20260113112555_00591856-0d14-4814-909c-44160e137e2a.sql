-- Add policy to allow admins to view doctor documents for verification
CREATE POLICY "Admins can view all doctor documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'doctor-documents' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);