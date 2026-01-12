import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Shield, ShieldCheck, ShieldX, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Interaction {
  drug1: string;
  drug2: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

interface DrugInteractionCheckerProps {
  initialDrugs?: string[];
}

export function DrugInteractionChecker({ initialDrugs = [] }: DrugInteractionCheckerProps) {
  const [open, setOpen] = useState(false);
  const [drugs, setDrugs] = useState<string[]>(initialDrugs);
  const [newDrug, setNewDrug] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const addDrug = () => {
    if (newDrug.trim() && !drugs.includes(newDrug.trim())) {
      setDrugs([...drugs, newDrug.trim()]);
      setNewDrug('');
      setHasChecked(false);
    }
  };

  const removeDrug = (drug: string) => {
    setDrugs(drugs.filter(d => d !== drug));
    setHasChecked(false);
  };

  const checkInteractions = async () => {
    if (drugs.length < 2) {
      toast.error('Please add at least 2 drugs to check for interactions');
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-drug-interactions', {
        body: { drugs }
      });

      if (error) throw error;
      setInteractions(data.interactions || []);
      setHasChecked(true);
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast.error('Failed to check drug interactions');
    } finally {
      setIsChecking(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldX className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'moderate': return <Shield className="h-5 w-5" />;
      default: return <ShieldCheck className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Check Interactions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Drug Interaction Checker
          </DialogTitle>
          <DialogDescription>
            Add medications to check for potential drug interactions using AI analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add drugs */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter drug name..."
              value={newDrug}
              onChange={(e) => setNewDrug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDrug()}
            />
            <Button onClick={addDrug} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Drug list */}
          <div className="flex flex-wrap gap-2">
            {drugs.map(drug => (
              <Badge key={drug} variant="secondary" className="gap-1.5 px-3 py-1.5">
                {drug}
                <button onClick={() => removeDrug(drug)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {drugs.length === 0 && (
              <p className="text-sm text-muted-foreground">No drugs added yet</p>
            )}
          </div>

          {/* Check button */}
          <Button 
            onClick={checkInteractions} 
            disabled={drugs.length < 2 || isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing interactions...
              </>
            ) : (
              'Check for Interactions'
            )}
          </Button>

          {/* Results */}
          {hasChecked && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold">Results</h4>
              {interactions.length === 0 ? (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">No significant interactions found</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        These medications appear to be safe to use together.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                interactions.map((interaction, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`p-3 flex items-center gap-3 ${getSeverityColor(interaction.severity)}`}>
                        {getSeverityIcon(interaction.severity)}
                        <div>
                          <p className="font-semibold">{interaction.drug1} + {interaction.drug2}</p>
                          <p className="text-sm opacity-90">Severity: {interaction.severity.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-sm">{interaction.description}</p>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium">Recommendation:</p>
                          <p className="text-sm text-muted-foreground">{interaction.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
