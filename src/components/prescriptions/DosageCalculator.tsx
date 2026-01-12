import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DosageResult {
  dose: string;
  frequency: string;
  totalDaily: string;
  notes: string;
}

// Common pediatric dosing guidelines (simplified for demonstration)
const DRUG_DOSAGES: Record<string, { dosePerKg: number; unit: string; maxDose: number; frequency: string; notes: string }> = {
  'paracetamol': { dosePerKg: 15, unit: 'mg', maxDose: 1000, frequency: 'every 4-6 hours', notes: 'Max 4 doses in 24 hours' },
  'ibuprofen': { dosePerKg: 10, unit: 'mg', maxDose: 400, frequency: 'every 6-8 hours', notes: 'Take with food' },
  'amoxicillin': { dosePerKg: 25, unit: 'mg', maxDose: 500, frequency: 'every 8 hours', notes: 'Complete full course' },
  'azithromycin': { dosePerKg: 10, unit: 'mg', maxDose: 500, frequency: 'once daily', notes: 'Day 1: double dose' },
  'cetirizine': { dosePerKg: 0.25, unit: 'mg', maxDose: 10, frequency: 'once daily', notes: 'May cause drowsiness' },
  'metformin': { dosePerKg: 0, unit: 'mg', maxDose: 2000, frequency: 'twice daily', notes: 'Adult dosing: 500-1000mg twice daily' },
};

export function DosageCalculator() {
  const [open, setOpen] = useState(false);
  const [drug, setDrug] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years');
  const [result, setResult] = useState<DosageResult | null>(null);

  const calculateDosage = () => {
    if (!drug || !weight) return;

    const drugInfo = DRUG_DOSAGES[drug.toLowerCase()];
    if (!drugInfo) {
      setResult({
        dose: 'N/A',
        frequency: 'N/A',
        totalDaily: 'N/A',
        notes: 'Drug not in database. Please consult reference materials.'
      });
      return;
    }

    const weightKg = parseFloat(weight);
    const ageValue = age ? parseFloat(age) : 0;
    const ageInYears = ageUnit === 'months' ? ageValue / 12 : ageValue;

    let calculatedDose = drugInfo.dosePerKg * weightKg;
    
    // Apply max dose limit
    if (calculatedDose > drugInfo.maxDose) {
      calculatedDose = drugInfo.maxDose;
    }

    // For adult dosing (metformin, etc.)
    if (drugInfo.dosePerKg === 0) {
      setResult({
        dose: `${drugInfo.maxDose / 2}-${drugInfo.maxDose} ${drugInfo.unit}`,
        frequency: drugInfo.frequency,
        totalDaily: `${drugInfo.maxDose}-${drugInfo.maxDose * 2} ${drugInfo.unit}`,
        notes: drugInfo.notes
      });
      return;
    }

    // Calculate doses per day based on frequency
    let dosesPerDay = 3;
    if (drugInfo.frequency.includes('once daily')) dosesPerDay = 1;
    else if (drugInfo.frequency.includes('twice')) dosesPerDay = 2;
    else if (drugInfo.frequency.includes('4-6')) dosesPerDay = 4;
    else if (drugInfo.frequency.includes('6-8')) dosesPerDay = 3;

    setResult({
      dose: `${Math.round(calculatedDose)} ${drugInfo.unit}`,
      frequency: drugInfo.frequency,
      totalDaily: `${Math.round(calculatedDose * dosesPerDay)} ${drugInfo.unit}/day`,
      notes: drugInfo.notes + (ageInYears < 2 ? ' | ⚠️ Consult pediatric specialist for infants' : '')
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Dosage Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dosage Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate appropriate medication dosages based on patient weight
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drug selection */}
          <div>
            <Label>Medication</Label>
            <Select value={drug} onValueChange={setDrug}>
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paracetamol">Paracetamol (Acetaminophen)</SelectItem>
                <SelectItem value="ibuprofen">Ibuprofen</SelectItem>
                <SelectItem value="amoxicillin">Amoxicillin</SelectItem>
                <SelectItem value="azithromycin">Azithromycin</SelectItem>
                <SelectItem value="cetirizine">Cetirizine</SelectItem>
                <SelectItem value="metformin">Metformin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient weight */}
          <div>
            <Label className="flex items-center gap-2">
              Patient Weight (kg)
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Weight is essential for accurate pediatric dosing</TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 25"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Patient age */}
          <div>
            <Label>Patient Age (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="flex-1"
              />
              <Select value={ageUnit} onValueChange={(v: 'years' | 'months') => setAgeUnit(v)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate button */}
          <Button onClick={calculateDosage} className="w-full" disabled={!drug || !weight}>
            Calculate Dosage
          </Button>

          {/* Results */}
          {result && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-lg">Recommended Dosage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Single Dose</p>
                    <p className="font-semibold text-primary text-lg">{result.dose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-semibold">{result.frequency}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Total Daily Dose</p>
                    <p className="font-semibold">{result.totalDaily}</p>
                  </div>
                </div>
                {result.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {result.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ This calculator is for reference only. Always verify dosages with current clinical guidelines and consider patient-specific factors.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
