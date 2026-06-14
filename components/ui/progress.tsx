import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: number | null;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, ...props }, ref) => {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      ref={ref}
      role="progressbar"
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
