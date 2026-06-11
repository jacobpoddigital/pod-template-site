import * as React from "react";
import { cn } from "@/lib/utils";

// Primitive — no CMS knowledge.
// Always pair with <Label>. Pass id to both.

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 body text-foreground " +
            "placeholder:text-muted-foreground " +
            "disabled:cursor-not-allowed disabled:opacity-50 " +
            "outline-none resize-y focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 " +
            "motion-safe:transition-colors",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          {...props}
        />
        {error && id && (
          <p id={`${id}-error`} className="body-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
