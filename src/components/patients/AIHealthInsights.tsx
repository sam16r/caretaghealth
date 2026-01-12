import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertTriangle, TrendingUp, Activity, Heart, Droplets, CheckCircle2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface HealthInsights {
  overallStatus: 'good' | 'moderate' | 'concerning' | 'critical';
  summary: string;
  risks: Array<{ title: string; severity: 'low' | 'medium' | 'high'; description: string }>;
  recommendations: Array<{ category: string; title: string; priority: string; details: string }>;
  vitalsTrend: { heartRate: string; bloodPressure: string; oxygenation: string };
  nextSteps: string[];
}

interface AIHealthInsightsProps {
  patientId: string;
  patientName: string;
}

export function AIHealthInsights({ patientId, patientName }: AIHealthInsightsProps) {
  const [open, setOpen] = useState(false);

  const { data: insights, isLoading, error, refetch } = useQuery({
    queryKey: ['health-insights', patientId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('health-insights', {
        body: { patientId }
      });

      if (error) {
        console.error('Error fetching health insights:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as HealthInsights;
    },
    enabled: open, // Only fetch when dialog is opened
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'concerning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge className="bg-red-500">High Risk</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium Risk</Badge>;
      default: return <Badge variant="secondary">Low Risk</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'fluctuating': return <Activity className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Brain className="h-4 w-4" />
          AI Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Health Insights
          </DialogTitle>
          <DialogDescription>
            AI-powered health analysis for {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Failed to Generate Insights</h3>
                <p className="text-muted-foreground mt-2">{(error as Error).message}</p>
                <Button onClick={() => refetch()} className="mt-4 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : insights ? (
            <>
              {/* Overall Status */}
              <Card className="overflow-hidden">
                <div className={`${getStatusColor(insights.overallStatus)} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg capitalize">Overall Status: {insights.overallStatus}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => refetch()}
                      className="text-white hover:bg-white/20"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 opacity-90">{insights.summary}</p>
                </div>
              </Card>

              {/* Vitals Trends */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Vitals Trends
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Heart Rate</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize">{insights.vitalsTrend.heartRate}</span>
                          {getTrendIcon(insights.vitalsTrend.heartRate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Pressure</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize">{insights.vitalsTrend.bloodPressure}</span>
                          {getTrendIcon(insights.vitalsTrend.bloodPressure)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Droplets className="h-5 w-5 text-cyan-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Oxygenation</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium capitalize">{insights.vitalsTrend.oxygenation}</span>
                          {getTrendIcon(insights.vitalsTrend.oxygenation)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Risks */}
              {insights.risks.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Identified Health Risks
                    </h4>
                    <div className="space-y-3">
                      {insights.risks.map((risk, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-warning">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{risk.title}</span>
                            {getSeverityBadge(risk.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {insights.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <Badge variant="outline" className="shrink-0 capitalize">
                            {rec.category}
                          </Badge>
                          <div>
                            <p className="font-medium">{rec.title}</p>
                            <p className="text-sm text-muted-foreground">{rec.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              {insights.nextSteps.length > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Suggested Next Steps</h4>
                    <ul className="space-y-2">
                      {insights.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center px-4">
                ⚠️ AI-generated insights are for clinical decision support only. Always verify with clinical judgment and patient assessment.
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
