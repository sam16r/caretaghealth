
# Fix AI Health Insights and Video Consultation Dialog Display

## Problem Identified
The dialogs appear to be working based on session replay data, but there are two potential issues:
1. **Browser caching** - The user may be viewing a cached version without the dialog centering fix
2. **Skeleton component ref warning** - The Skeleton component doesn't forward refs, which can interfere with Radix UI dialog rendering

## Solution

### Step 1: Fix the Skeleton Component (Required)
Update `src/components/ui/skeleton.tsx` to properly forward refs using `React.forwardRef`:

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
```

### Step 2: Verify Dialog Centering (Already Applied)
The `src/components/ui/dialog.tsx` already has the correct centering fix with the flex wrapper approach. No changes needed.

### Step 3: Verify Component Dialog Classes (Already Correct)
Both `AIHealthInsights.tsx` and `Telemedicine.tsx` have the correct DialogContent classes:
- `max-w-3xl w-[90vw] h-auto max-h-[85vh] flex flex-col`

## Technical Details
- The Skeleton component is used in the loading state of AIHealthInsights
- Radix UI Dialog internally passes refs to child components
- When a component doesn't forward refs, React shows a warning and the component may not render correctly
- The flex-based centering in dialog.tsx is more reliable than CSS transform-based centering

## Files to Modify
| File | Change |
|------|--------|
| `src/components/ui/skeleton.tsx` | Add React.forwardRef wrapper |

## Expected Outcome
After these changes and a hard browser refresh:
- AI Health Insights dialog will display centered on screen
- Video Consultation dialog will display centered on screen
- No more React ref warnings in the console
- Consistent dialog behavior across all components
