import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '../FileUpload';
import { Shield, Clock } from 'lucide-react';

interface VerificationData {
  medicalCouncilNumber: string;
  registeringAuthority: string;
  registrationYear: string;
  degreeCertificate: File | null;
  idProof: File | null;
  professionalPhoto: File | null;
}

interface DoctorVerificationStepProps {
  data: VerificationData;
  onChange: (data: Partial<VerificationData>) => void;
  errors: Partial<Record<keyof VerificationData, string>>;
}

const authorities = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'State Medical Council - Andhra Pradesh',
  'State Medical Council - Karnataka',
  'State Medical Council - Maharashtra',
  'State Medical Council - Tamil Nadu',
  'State Medical Council - Delhi',
  'State Medical Council - Gujarat',
  'State Medical Council - Kerala',
  'State Medical Council - West Bengal',
  'State Medical Council - Other'
];

const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export function DoctorVerificationStep({ data, onChange, errors }: DoctorVerificationStepProps) {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Doctor Verification</p>
          <p className="text-xs text-muted-foreground mt-1">
            We verify doctors to ensure patient safety and trust. All documents are kept secure and confidential.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalCouncilNumber" className="text-sm font-medium">
          Medical Council Registration Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="medicalCouncilNumber"
          type="text"
          placeholder="e.g., MCI-12345"
          value={data.medicalCouncilNumber}
          onChange={(e) => onChange({ medicalCouncilNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.medicalCouncilNumber ? 'border-destructive' : ''}`}
        />
        {errors.medicalCouncilNumber && <p className="text-xs text-destructive">{errors.medicalCouncilNumber}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Registering Authority <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.registeringAuthority} 
            onValueChange={(v) => onChange({ registeringAuthority: v })}
          >
            <SelectTrigger className={`h-11 rounded-xl ${errors.registeringAuthority ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Select authority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {authorities.map(a => (
                <SelectItem key={a} value={a} className="rounded-lg">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.registeringAuthority && <p className="text-xs text-destructive">{errors.registeringAuthority}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Year of Registration <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.registrationYear} 
            onValueChange={(v) => onChange({ registrationYear: v })}
          >
            <SelectTrigger className={`h-11 rounded-xl ${errors.registrationYear ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {years.map(y => (
                <SelectItem key={y} value={y} className="rounded-lg">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.registrationYear && <p className="text-xs text-destructive">{errors.registrationYear}</p>}
        </div>
      </div>

      <FileUpload
        label="Degree Certificate"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.degreeCertificate}
        onChange={(file) => onChange({ degreeCertificate: file })}
        error={errors.degreeCertificate}
        required
      />

      <FileUpload
        label="ID Proof (Aadhaar/PAN/Passport)"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.idProof}
        onChange={(file) => onChange({ idProof: file })}
        error={errors.idProof}
        required
      />

      <FileUpload
        label="Professional Photo"
        accept=".png,.jpg,.jpeg"
        value={data.professionalPhoto}
        onChange={(file) => onChange({ professionalPhoto: file })}
        error={errors.professionalPhoto}
        required
      />

      {/* Verification timeline */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Verification Status:</span> Pending (24–48 hours after submission)
        </p>
      </div>
    </div>
  );
}
