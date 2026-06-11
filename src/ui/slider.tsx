import { cn } from "@/lib/utils";

// CSS scroll-snap slider — NO JavaScript, no dependency. Horizontal overflow with
// snap points; keyboard-scrollable (focusable region). Each SliderItem peeks the
// next card on smaller screens. Used for the `slider` layout on card/review grids.
export function Slider({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label ?? "Carousel"}
      tabIndex={0}
      className={cn(
        "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SliderItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-w-0 shrink-0 snap-start basis-4/5 sm:basis-1/2 lg:basis-1/3", className)}>{children}</div>;
}
