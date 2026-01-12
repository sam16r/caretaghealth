import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccountData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

interface AccountSetupStepProps {
  data: AccountData;
  onChange: (data: Partial<AccountData>) => void;
  errors: Partial<Record<keyof AccountData, string>>;
}

export function AccountSetupStep({ data, onChange, errors }: AccountSetupStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Dr. John Smith"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          className={`h-11 rounded-xl ${errors.fullName ? 'border-destructive' : ''}`}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="doctor@hospital.com"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={`h-11 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobileNumber" className="text-sm font-medium">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="mobileNumber"
          type="tel"
          placeholder="+91 98765 43210"
          value={data.mobileNumber}
          onChange={(e) => onChange({ mobileNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.mobileNumber ? 'border-destructive' : ''}`}
        />
        {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber}</p>}
        <p className="text-xs text-muted-foreground">We'll send an OTP for verification</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password <span className="text-destructive">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={data.password}
          onChange={(e) => onChange({ password: e.target.value })}
          className={`h-11 rounded-xl ${errors.password ? 'border-destructive' : ''}`}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password <span className="text-destructive">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={data.confirmPassword}
          onChange={(e) => onChange({ confirmPassword: e.target.value })}
          className={`h-11 rounded-xl ${errors.confirmPassword ? 'border-destructive' : ''}`}
        />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
      </div>
    </div>
  );
}
