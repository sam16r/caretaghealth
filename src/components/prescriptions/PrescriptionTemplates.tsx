import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Star, Trash2, Copy, Pill } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Template {
  id: string;
  name: string;
  diagnosis: string | null;
  medications: Medication[];
  notes: string | null;
  is_favorite: boolean;
}

interface PrescriptionTemplatesProps {
  onUseTemplate?: (template: Template) => void;
}

export function PrescriptionTemplates({ onUseTemplate }: PrescriptionTemplatesProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    diagnosis: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }] as Medication[]
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['prescription-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescription_templates')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(t => ({
        ...t,
        medications: (t.medications as unknown) as Medication[]
      })) as Template[];
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const medicationsJson = JSON.parse(JSON.stringify(newTemplate.medications.filter(m => m.name)));
      const { error } = await supabase.from('prescription_templates').insert([{
        doctor_id: user.id,
        name: newTemplate.name,
        diagnosis: newTemplate.diagnosis || null,
        medications: medicationsJson,
        notes: newTemplate.notes || null
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] });
      toast.success('Template created successfully');
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        diagnosis: '',
        notes: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prescription_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] });
      toast.success('Template deleted');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('prescription_templates')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] });
    }
  });

  const addMedication = () => {
    setNewTemplate({
      ...newTemplate,
      medications: [...newTemplate.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const meds = [...newTemplate.medications];
    meds[index] = { ...meds[index], [field]: value };
    setNewTemplate({ ...newTemplate, medications: meds });
  };

  const removeMedication = (index: number) => {
    if (newTemplate.medications.length > 1) {
      setNewTemplate({
        ...newTemplate,
        medications: newTemplate.medications.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prescription Templates
          </DialogTitle>
          <DialogDescription>
            Save and reuse common prescription templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new template button */}
          {!showCreateForm ? (
            <Button onClick={() => setShowCreateForm(true)} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Template Name *</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="e.g., Common Cold Treatment"
                    />
                  </div>
                  <div>
                    <Label>Diagnosis</Label>
                    <Input
                      value={newTemplate.diagnosis}
                      onChange={(e) => setNewTemplate({ ...newTemplate, diagnosis: e.target.value })}
                      placeholder="e.g., Upper respiratory infection"
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <Label className="mb-2 block">Medications</Label>
                    <div className="space-y-3">
                      {newTemplate.medications.map((med, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 items-end">
                          <Input
                            placeholder="Drug name"
                            value={med.name}
                            onChange={(e) => updateMedication(i, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) => updateMedication(i, 'dosage', e.target.value)}
                          />
                          <Input
                            placeholder="Frequency"
                            value={med.frequency}
                            onChange={(e) => updateMedication(i, 'frequency', e.target.value)}
                          />
                          <Input
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => updateMedication(i, 'duration', e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMedication(i)}
                            disabled={newTemplate.medications.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addMedication} className="gap-1">
                        <Plus className="h-3 w-3" /> Add Medication
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newTemplate.notes}
                      onChange={(e) => setNewTemplate({ ...newTemplate, notes: e.target.value })}
                      placeholder="Additional instructions..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={!newTemplate.name || createMutation.isPending}
                  >
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates list */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : templates && templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          {template.is_favorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {template.diagnosis && (
                          <p className="text-sm text-muted-foreground">{template.diagnosis}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {template.medications.map((med, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Pill className="h-3 w-3 mr-1" />
                              {med.name} {med.dosage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavoriteMutation.mutate({ id: template.id, isFavorite: template.is_favorite })}
                        >
                          <Star className={`h-4 w-4 ${template.is_favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </Button>
                        {onUseTemplate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              onUseTemplate(template);
                              setOpen(false);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No templates yet</p>
                <p className="text-sm">Create your first template to save time</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
