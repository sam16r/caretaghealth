import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfessionalData {
  primaryQualification: string;
  specialization: string;
  yearsOfExperience: string;
  languagesSpoken: string[];
}

interface ProfessionalDetailsStepProps {
  data: ProfessionalData;
  onChange: (data: Partial<ProfessionalData>) => void;
  errors: Partial<Record<keyof ProfessionalData, string>>;
}

const qualifications = [
  'MBBS',
  'MD',
  'MS',
  'BAMS',
  'BHMS',
  'BDS',
  'MDS',
  'DNB',
  'DM',
  'MCh',
  'Other'
];

const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other'
];

const languages = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Odia',
  'Urdu'
];

export function ProfessionalDetailsStep({ data, onChange, errors }: ProfessionalDetailsStepProps) {
  const handleLanguageChange = (language: string) => {
    const current = data.languagesSpoken || [];
    if (current.includes(language)) {
      onChange({ languagesSpoken: current.filter(l => l !== language) });
    } else {
      onChange({ languagesSpoken: [...current, language] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Primary Qualification <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={data.primaryQualification} 
          onValueChange={(v) => onChange({ primaryQualification: v })}
        >
          <SelectTrigger className={`h-11 rounded-xl ${errors.primaryQualification ? 'border-destructive' : ''}`}>
            <SelectValue placeholder="Select qualification" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {qualifications.map(q => (
              <SelectItem key={q} value={q} className="rounded-lg">{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.primaryQualification && <p className="text-xs text-destructive">{errors.primaryQualification}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Specialization <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Select 
          value={data.specialization} 
          onValueChange={(v) => onChange({ specialization: v })}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {specializations.map(s => (
              <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience" className="text-sm font-medium">
          Years of Experience <span className="text-destructive">*</span>
        </Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="60"
          placeholder="5"
          value={data.yearsOfExperience}
          onChange={(e) => onChange({ yearsOfExperience: e.target.value })}
          className={`h-11 rounded-xl ${errors.yearsOfExperience ? 'border-destructive' : ''}`}
        />
        {errors.yearsOfExperience && <p className="text-xs text-destructive">{errors.yearsOfExperience}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Languages Spoken <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                data.languagesSpoken?.includes(lang)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-border hover:border-primary/50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        {errors.languagesSpoken && <p className="text-xs text-destructive">{errors.languagesSpoken}</p>}
      </div>
    </div>
  );
}
