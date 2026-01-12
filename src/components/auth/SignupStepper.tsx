import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignupStepperProps {
  currentStep: number;
  steps: { title: string; description: string }[];
}

export function SignupStepper({ currentStep, steps }: SignupStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium",
                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-primary">
          Step {currentStep + 1}: {steps[currentStep]?.title}
        </p>
      </div>
    </div>
  );
}
