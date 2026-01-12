import { Check, User, Briefcase, Shield, Building2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ReviewData {
  account: {
    fullName: string;
    email: string;
    mobileNumber: string;
  };
  professional: {
    primaryQualification: string;
    specialization: string;
    yearsOfExperience: string;
    languagesSpoken: string[];
  };
  verification: {
    medicalCouncilNumber: string;
    registeringAuthority: string;
    registrationYear: string;
    degreeCertificate: File | null;
    idProof: File | null;
    professionalPhoto: File | null;
  };
  practice: {
    clinicName: string;
    clinicAddress: string;
    city: string;
    state: string;
    consultationType: string;
  };
  termsAccepted: boolean;
}

interface ReviewSubmitStepProps {
  data: ReviewData;
  onTermsChange: (accepted: boolean) => void;
  error?: string;
}

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="p-4 space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | string[] }) {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{displayValue || '—'}</span>
    </div>
  );
}

export function ReviewSubmitStep({ data, onTermsChange, error }: ReviewSubmitStepProps) {
  const consultationTypeLabels: Record<string, string> = {
    'in-person': 'In-person only',
    'online': 'Online only',
    'both': 'In-person & Online'
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-success-foreground" />
        </div>
        <p className="text-sm">
          <span className="font-medium">Almost there!</span> Please review your information before submitting.
        </p>
      </div>

      <SectionCard icon={User} title="Account Information">
        <InfoRow label="Full Name" value={data.account.fullName} />
        <InfoRow label="Email" value={data.account.email} />
        <InfoRow label="Mobile" value={data.account.mobileNumber} />
      </SectionCard>

      <SectionCard icon={Briefcase} title="Professional Details">
        <InfoRow label="Qualification" value={data.professional.primaryQualification} />
        <InfoRow label="Specialization" value={data.professional.specialization} />
        <InfoRow label="Experience" value={`${data.professional.yearsOfExperience} years`} />
        <InfoRow label="Languages" value={data.professional.languagesSpoken} />
      </SectionCard>

      <SectionCard icon={Shield} title="Verification Details">
        <InfoRow label="Registration No." value={data.verification.medicalCouncilNumber} />
        <InfoRow label="Authority" value={data.verification.registeringAuthority} />
        <InfoRow label="Year" value={data.verification.registrationYear} />
        <InfoRow 
          label="Documents" 
          value={[
            data.verification.degreeCertificate ? '✓ Certificate' : '',
            data.verification.idProof ? '✓ ID Proof' : '',
            data.verification.professionalPhoto ? '✓ Photo' : ''
          ].filter(Boolean).join(', ')} 
        />
      </SectionCard>

      <SectionCard icon={Building2} title="Practice Details">
        <InfoRow label="Clinic/Hospital" value={data.practice.clinicName} />
        <InfoRow label="Address" value={data.practice.clinicAddress} />
        <InfoRow label="City, State" value={`${data.practice.city}, ${data.practice.state}`} />
        <InfoRow label="Consultation" value={consultationTypeLabels[data.practice.consultationType] || data.practice.consultationType} />
      </SectionCard>

      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        data.termsAccepted ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${error ? 'border-destructive' : ''}`}>
        <Checkbox
          checked={data.termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
          className="mt-0.5"
        />
        <div>
          <p className="text-sm">
            I confirm that all the information provided is accurate and I agree to the{' '}
            <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>.
          </p>
        </div>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
