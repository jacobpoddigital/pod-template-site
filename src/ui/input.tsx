import * as React from "react";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge.
// Always pair with <Label>. Pass id to both — Label's htmlFor must match Input's id.

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground md:text-sm " +
            "placeholder:text-muted-foreground " +
            "disabled:cursor-not-allowed disabled:opacity-50 " +
            "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 " +
            "motion-safe:transition-colors",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          {...props}
        />
        {error && id && (
          <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
