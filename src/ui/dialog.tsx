"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Composite — Radix Dialog. Handles focus trap, ESC dismissal, scroll lock, aria-modal.
// Never hand-roll — focus management alone justifies using this.
//
// AGENCY MODAL STANDARD (don't re-derive per project): DialogContent is FULL-SCREEN on mobile and
// a centred modal on >=sm BY DEFAULT (`mobile="fullscreen"`) — the same overlay language as the
// Sheet drawers (cart, filter) and the gallery lightbox, so every modal behaves consistently on a
// phone. Small confirm/alert dialogs that should stay a centred card on mobile opt out with
// `mobile="centered"`. Elevation = border (not shadow); the close is a 40px padded target (WCAG
// 2.5.8). Compose a full-height modal as: <DialogContent className="flex flex-col gap-0 p-0">
// <header className="h-[60px] border-b px-6"><DialogTitle/></header>
// <div className="flex-1 overflow-y-auto p-6">…</div> </DialogContent>.

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[var(--z-overlay)] bg-black/60 backdrop-blur-sm " +
      "data-[state=open]:animate-in data-[state=closed]:animate-out " +
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const dialogContentVariants = cva(
  // Shared: fixed + centred anchor + animation + border elevation (no shadow — house rule).
  "fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2 " +
    "border border-border bg-background " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out " +
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 " +
    "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      mobile: {
        // DEFAULT — full-screen on mobile, centred modal on >=sm. Uses 100dvh (the DYNAMIC viewport
        // height) top-anchored, NOT h-full/inset-0: on iOS Safari `h-full`/`100vh` fills the LAYOUT
        // viewport (behind the address-bar/toolbar), so the bottom of the modal — and its content,
        // e.g. the Add-to-bag button — is hidden under the browser chrome. `100dvh` shrinks with the
        // visible toolbar so the modal is exactly the visible area.
        fullscreen:
          "w-full max-w-lg rounded-lg p-6 " +
          "max-sm:inset-x-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-h-none max-sm:w-full max-sm:max-w-none " +
          "max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0",
        // Opt-out — stays a centred card even on mobile (small confirm/alert dialogs).
        centered: "w-full max-w-lg rounded-lg p-6",
      },
    },
    defaultVariants: { mobile: "fullscreen" },
  }
);

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, mobile, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ mobile }), className)}
      {...props}
    >
      {children}
      {/* 40px padded hit area (WCAG 2.5.8 target size), icon stays visually small. */}
      <DialogClose className="absolute right-2.5 top-2.5 inline-flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("display-xs text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("body-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
