import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PracticeData {
  clinicName: string;
  clinicAddress: string;
  city: string;
  state: string;
  consultationType: string;
}

interface PracticeDetailsStepProps {
  data: PracticeData;
  onChange: (data: Partial<PracticeData>) => void;
  errors: Partial<Record<keyof PracticeData, string>>;
}

const states = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry'
];

const consultationTypes = [
  { value: 'in-person', label: 'In-person only', description: 'Physical consultations at clinic' },
  { value: 'online', label: 'Online only', description: 'Video/audio consultations' },
  { value: 'both', label: 'Both', description: 'In-person and online consultations' }
];

export function PracticeDetailsStep({ data, onChange, errors }: PracticeDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinicName" className="text-sm font-medium">
          Clinic / Hospital Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="clinicName"
          type="text"
          placeholder="City Medical Center"
          value={data.clinicName}
          onChange={(e) => onChange({ clinicName: e.target.value })}
          className={`h-11 rounded-xl ${errors.clinicName ? 'border-destructive' : ''}`}
        />
        {errors.clinicName && <p className="text-xs text-destructive">{errors.clinicName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicAddress" className="text-sm font-medium">
          Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="clinicAddress"
          type="text"
          placeholder="123, Main Street, Sector 5"
          value={data.clinicAddress}
          onChange={(e) => onChange({ clinicAddress: e.target.value })}
          className={`h-11 rounded-xl ${errors.clinicAddress ? 'border-destructive' : ''}`}
        />
        {errors.clinicAddress && <p className="text-xs text-destructive">{errors.clinicAddress}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Mumbai"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={`h-11 rounded-xl ${errors.city ? 'border-destructive' : ''}`}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            State <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={data.state} 
            onValueChange={(v) => onChange({ state: v })}
          >
            <SelectTrigger className={`h-11 rounded-xl ${errors.state ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {states.map(s => (
                <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Consultation Type <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.consultationType}
          onValueChange={(v) => onChange({ consultationType: v })}
          className="space-y-2"
        >
          {consultationTypes.map(type => (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                data.consultationType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={type.value} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
        {errors.consultationType && <p className="text-xs text-destructive">{errors.consultationType}</p>}
      </div>
    </div>
  );
}
