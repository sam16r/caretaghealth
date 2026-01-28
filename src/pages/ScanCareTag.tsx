import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Wifi, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ScanState = 'scanning' | 'found' | 'redirecting';

export default function ScanCareTag() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [patient, setPatient] = useState<{ id: string; full_name: string; caretag_id: string } | null>(null);

  useEffect(() => {
    const scanForPatient = async () => {
      // Simulate scanning delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Fetch a random patient to simulate scanning
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, caretag_id')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPatient(data);
          setScanState('found');
          
          // Brief pause to show "found" state
          await new Promise(resolve => setTimeout(resolve, 1500));
          setScanState('redirecting');
          
          // Navigate to patient details
          await new Promise(resolve => setTimeout(resolve, 500));
          navigate(`/patients/${data.id}`);
        } else {
          toast.error('No patients found in the system');
          navigate('/emergency');
        }
      } catch (err) {
        console.error('Scan error:', err);
        toast.error('Failed to scan CareTag. Please try again.');
        navigate('/emergency');
      }
    };

    scanForPatient();
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {scanState === 'scanning' && (
            <>
              <div className="absolute w-64 h-64 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-80 h-80 -ml-8 -mt-8 rounded-full border-2 border-primary/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute w-96 h-96 -ml-16 -mt-16 rounded-full border-2 border-primary/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </>
          )}
          {scanState === 'found' && (
            <div className="absolute w-64 h-64 rounded-full bg-success/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Icon */}
        <div className={`relative p-8 rounded-full transition-all duration-500 ${
          scanState === 'scanning' 
            ? 'bg-primary/10' 
            : scanState === 'found' 
            ? 'bg-success/10' 
            : 'bg-success/20'
        }`}>
          {scanState === 'scanning' && (
            <>
              <ScanLine className="h-16 w-16 text-primary animate-pulse" />
              <Wifi className="absolute top-2 right-2 h-6 w-6 text-primary/60 animate-bounce" />
            </>
          )}
          {(scanState === 'found' || scanState === 'redirecting') && (
            <CheckCircle2 className="h-16 w-16 text-success" />
          )}
        </div>

        {/* Status text */}
        <div className="text-center space-y-3">
          {scanState === 'scanning' && (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Scanning Nearby CareTag Card
              </h1>
              <p className="text-muted-foreground">
                Please hold the CareTag near the device...
              </p>
              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </>
          )}

          {scanState === 'found' && patient && (
            <>
              <h1 className="text-2xl font-bold text-success">
                CareTag Found!
              </h1>
              <div className="bg-card border border-border rounded-xl p-4 mt-4 min-w-[280px]">
                <p className="font-semibold text-lg">{patient.full_name}</p>
                <p className="text-sm text-muted-foreground">{patient.caretag_id}</p>
              </div>
            </>
          )}

          {scanState === 'redirecting' && (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Opening Patient Details...
              </h1>
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-4">
                <div className="h-full bg-primary animate-pulse w-full" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel hint */}
      {scanState === 'scanning' && (
        <button 
          onClick={() => navigate(-1)}
          className="absolute bottom-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Press anywhere to cancel
        </button>
      )}
    </div>
  );
}
